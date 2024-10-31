import React, { useState, useEffect } from "react";
import { connect } from "react-redux";

function SelectedDetails({ customerBooking }) {
	const [selectedItems, setSelectedItems] = useState([]);

	useEffect(() => {
		const { addons, gifts } = customerBooking;

		// Combine and map addons and gifts
		const selectedAddons = addons
			.filter((addon) => addon.count > 0)
			.map((addon) => ({
				title: addon.name,
				count: addon.count,
				amount: addon.price,
			}));

		const selectedGifts = gifts
			.filter((gift) => gift.count > 0)
			.map((gift) => ({
				title: gift.name,
				count: gift.count,
				amount: gift.price,
			}));

		// Combine both lists
		setSelectedItems([...selectedAddons, ...selectedGifts]);
	}, [customerBooking.addons, customerBooking.gifts]);

	if (selectedItems.length === 0) {
		return null;
	}

	return (
		<div className="bg-white p-5 rounded-lg">
			<h3 className="pb-2 border-b border-gray-400">Selected Items</h3>

			<div className="mt-5">
				{selectedItems.map((item, index) => (
					<div key={index} className="flex justify-between items-center mt-[6px]">
						<p className="w-1/2">{item.title}</p>
						<p>{item.count}</p>
						<p>{item.count * item.amount}</p>
					</div>
				))}
			</div>
		</div>
	);
}

const mapStateToProps = (state) => ({
	customerBooking: state.customerBooking,
});

export default connect(mapStateToProps, null)(SelectedDetails);
