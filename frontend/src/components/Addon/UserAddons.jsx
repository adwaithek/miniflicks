import React, { useEffect, useState, useRef } from "react";
import { connect, useDispatch } from "react-redux";
import { setBookingAddons, setBookingGifts, setBookingCakes, setBookingOtherInfo } from "../../redux/customerBooking/customerBookingActions";
import { getAllAddons } from "../../redux/addon/addonActions";
import { getAllGifts } from "../../redux/gift/giftActions";
import { getAllCakes } from "../../redux/cake/cakeActions";

function UserItems({ customerBooking, type, addonsData, giftsData, cakesData }) {
	const [selected, setSelected] = useState([]);
	const [ledInfo, setLedInfo] = useState("");
	const [nameOnCake, setNameOnCake] = useState("");
	const dispatch = useDispatch();

	const normalCakes = useRef(null);
	const specialCakes = useRef(null);

	// Configuration for different item types
	const config = {
		addons: {
			fetchAction: getAllAddons,
			stateData: addonsData.addons,
			setBookingAction: setBookingAddons,
			selectedItems: customerBooking.addons,
		},
		gifts: {
			fetchAction: getAllGifts,
			stateData: giftsData.gifts,
			setBookingAction: setBookingGifts,
			selectedItems: customerBooking.gifts,
		},
		cakes: {
			fetchAction: getAllCakes,
			stateData: cakesData.cakes,
			setBookingAction: setBookingCakes,
			selectedItems: customerBooking.cakes,
		},
	};

	const { fetchAction, stateData, setBookingAction, selectedItems } = config[type] || {};

	// Fetch items based on type
	useEffect(() => {
		if (fetchAction) {
			dispatch(fetchAction());
		}
	}, [fetchAction, dispatch]);

	// Sync with customerBooking
	useEffect(() => {
		if (selectedItems) {
			setSelected(selectedItems);
		}
	}, [selectedItems]);

	// Handle item selection
	function handleSelect(item) {
		const existed = selected.find((current) => item._id === current._id);

		const updatedSelected = existed ? selected.filter((current) => item._id !== current._id) : [...selected, { ...item, count: 1, free: selected.length == 0 ? true : false }];

		//here check weather there is nay any item inisde the selected have a value free == true if so then don't have to do anythign else set the first object inside the updatedSelected and set free=true
		const hasFreeItem = updatedSelected.some((current) => current.free === true);

		if (!hasFreeItem && updatedSelected.length > 0) {
			updatedSelected[0] = { ...updatedSelected[0], free: true, price: updatedSelected[0].specialPrice };
		}

		setSelected(updatedSelected);
		dispatch(setBookingAction(updatedSelected));
	}

	// Handle count changes
	function handleCountChange(item, value) {
		const selectedItem = selected.find((current) => item._id === current._id);

		if (selectedItem) {
			if (value === -1 && selectedItem.count === 1) {
				handleSelect(item);
			} else {
				const updatedSelected = selected.map((current) => (current._id === item._id ? { ...current, count: current.count + value } : current));
				setSelected(updatedSelected);
				dispatch(setBookingAction(updatedSelected));
			}
		} else {
			handleSelect(item);
		}
	}

	useEffect(() => {
		if (!customerBooking.otherInfo) return;
		if (customerBooking.otherInfo) {
			setLedInfo(customerBooking.otherInfo.ledInfo);
			setNameOnCake(customerBooking.otherInfo.nameOnCake);
		}
	}, [customerBooking.otherInfo]);

	function handleOtherInfo(e) {
		if (type === "addons") {
			setLedInfo(e.target.value);
		}
		if (type === "cakes") {
			setNameOnCake(e.target.value);
		}
	}

	function handleBlur() {
		dispatch(setBookingOtherInfo({ ...customerBooking.otherInfo, ledInfo, nameOnCake }));
	}

	function handleKeyPress(e) {
		if (e.key === "Enter") {
			handleBlur();
		}
	}
	// Function to render each item card
	function ItemCard({ item, isSelected, isFree = false }) {
		return (
			<div className={`p-[1.5px] rounded-lg cursor-pointer selected-1 ${isSelected ? "selected" : ""}  relative w-full`} key={item._id} onClick={() => handleSelect(item)}>
				<div className="p-2 rounded-lg bg-bright">
					<div className="w-full aspect-[16/12] relative overflow-hidden rounded-md">
						<img className="absolute object-cover w-full h-full" src={item.image} alt={item.name} />
					</div>
					<h5 className="text-center mt-2">{item.name}</h5>
					<div className="flex justify-between mt-1 items-center gap-3">
						<p className="font-medium text-primary text-md whitespace-nowrap m-auto">₹ {isFree ? item.specialPrice : item.price}</p>
						{type !== "cakes" && (
							<div onClick={(e) => e.stopPropagation()} className="flex w-full items-center justify-between gap-[2px]">
								<button className="min-w-5 h-5 bg-gradient-primary rounded-sm flex items-center justify-center text-lg text-bright font-medium" onClick={() => handleCountChange(item, -1)}>
									-
								</button>
								<div className="w-full h-5 flex items-center justify-center border border-gray-400 rounded-sm">{isSelected ? isSelected.count : 0}</div>
								<button className="min-w-5 h-5 bg-gradient-primary rounded-sm flex items-center justify-center text-lg text-bright font-medium" onClick={() => handleCountChange(item, 1)}>
									+
								</button>
							</div>
						)}
					</div>
				</div>
				{isFree && <div className="absolute bg-gradient-primary text-bright top-1 left-1 text-xs px-1 py[2px] rounded-md">Pack</div>}
			</div>
		);
	}

	if (selected.length === 0) {
		let initial = type === "cakes" ? stateData.map((cake) => ({ ...cake, price: cake.specialPrice })) : [];

		normalCakes.current = type === "cakes" ? initial.filter((cake) => !cake.special) : [];
		specialCakes.current = type === "cakes" ? initial.filter((cake) => cake.special) : [];
	} else {
		normalCakes.current = type === "cakes" ? stateData.filter((cake) => !cake.special) : [];
		specialCakes.current = type === "cakes" ? stateData.filter((cake) => cake.special) : [];
	}
	// Separate cakes into Normal and Special categories if type is "cakes"

	return (
		<section className="option-section pt-6 mt-4 border-t border-white">
			{type === "cakes" && (
				<p className="bg-bright bg-opacity-80 inline-block px-4 py-[2px] rounded-md -mt-2 mb-2">
					<span className="font-medium">Note:</span> Select any 1 cake for free; special cakes include an additional package cost.
				</p>
			)}

			<div className="w-full">
				{type === "cakes" ? (
					<>
						{/* Render Normal Cakes Section */}
						{normalCakes.current.length > 0 && (
							<div>
								<h3 className="mb-3">Normal Cakes</h3>

								<div className="grid w-full gap-3 lg:gap-4 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4">
									{normalCakes.current.map((item) => {
										return <ItemCard item={item} key={item._id} isSelected={selected.find((current) => current._id === item._id)} isFree={selected.some((current) => current?.free == true && current._id === item._id)} />;
									})}
								</div>
							</div>
						)}

						{/* Render Special Cakes Section */}
						{specialCakes.current.length > 0 && (
							<div className="mt-6">
								<h3 className="mb-3">Special Cakes</h3>
								<div className="grid w-full gap-3 lg:gap-4 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4">
									{specialCakes.current.map((item) => {
										return <ItemCard item={item} key={item._id} isSelected={selected.find((current) => current._id === item._id)} isFree={selected.some((current) => current?.free == true && current._id === item._id)} />;
									})}
								</div>
							</div>
						)}
					</>
				) : (
					// Render items for addons or gifts
					<div className="grid w-full gap-3 lg:gap-5 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4">
						{stateData?.length > 0 ? (
							stateData.map((item) => <ItemCard item={item} key={item._id} isSelected={selected.find((current) => current._id === item._id)} />)
						) : (
							<div className="w-full flex items-center justify-center min-h-sm">
								<h3 className="text-gray-500 text-center">No Items Available</h3>
							</div>
						)}
					</div>
				)}
				{type === "addons" && selected.some((addon) => addon.name.toLowerCase().includes("led")) && (
					<div className="w-full md:max-w-[300px] mt-5 m-auto">
						<div className="input-wrapper ">
							<label htmlFor="ledInfo" className="whitespace-nowrap font-medium">
								Led Name or Number
							</label>
							<input type="text" placeholder="Led Name / Led Number" id="ledInfo" name="ledInfo" value={ledInfo} onChange={handleOtherInfo} onBlur={handleBlur} onKeyPress={handleKeyPress} />
						</div>
					</div>
				)}
				{type === "cakes" && selected.length > 0 && (
					<div className="w-full md:max-w-[300px] mt-5 m-auto">
						<div className="input-wrapper ">
							<label htmlFor="nameOnCake" className="whitespace-nowrap font-medium">
								Name On Cake
							</label>
							<input type="text" placeholder="Name On Cake" id="nameOnCake" name="nameOnCake" value={nameOnCake} onChange={handleOtherInfo} onBlur={handleBlur} onKeyPress={handleKeyPress} />
						</div>
					</div>
				)}
			</div>
		</section>
	);
}

const mapStateToProps = (state) => ({
	customerBooking: state.customerBooking,
	addonsData: state.addons,
	giftsData: state.gifts,
	cakesData: state.cakes,
});

export default connect(mapStateToProps)(UserItems);
