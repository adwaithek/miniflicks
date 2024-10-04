import React, { lazy } from "react";
import { connect } from "react-redux";
import { Route, Routes } from "react-router-dom";

import "./App.css";

import Home from "./pages/Home";
import Login from "./pages/Login";

import BackendLayout from "./layouts/BackendLayout";
import Locations from "./components/Locations/Locations";
import Dashboard from "./components/Dashboard/Dashboard";
import Cities from "./components/Cities/Cities";
import AddCities from "./components/Cities/addCities";
import CitiesWrapper from "./components/Cities/CitiesWrapper";
import Notification from "./components/Notifications/Notifications";
import Modal from "./components/Modal/Modal";

function App({ modal }) {
	return (
		<React.Fragment>
			<div className="bg-zinc-100 min-h-screen">
				<Notification />
				<Routes>
					<Route path="/" element={<Home />} />
					<Route path="/login" element={<Login />} />

					<Route path="/admin" element={<BackendLayout />}>
						<Route index element={<Dashboard />} />
						<Route path="locations">
							<Route index element={<Locations />} />
						</Route>
						<Route path="cities" element={<CitiesWrapper />}>
							<Route index element={<Cities />} />
							<Route path="add" element={<AddCities />} />
							<Route path="edit/:id" element={<AddCities update={true} />} />
						</Route>
					</Route>
				</Routes>
			</div>

			{modal.showModal && <Modal props={modal.modalProps} component={modal.modalComponent} />}
		</React.Fragment>
	);
}

const mapStateToProps = (state) => {
	return {
		modal: state.modal,
	};
};

export default connect(mapStateToProps, null)(App);
