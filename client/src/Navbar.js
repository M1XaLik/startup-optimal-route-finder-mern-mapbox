import React from "react";
import { Link } from "react-router-dom";

// IMPORT SOME ICONS
import { FaMapMarkerAlt, FaListUl } from "react-icons/fa";

function Navbar() {
    return (
        <nav className="navbar">
            <Link to="/" className="navbar-item">
                <FaListUl style={{ fontSize: "35" }} />
                {/* Locations */}
            </Link>
            <Link to="/map" className="navbar-item">
                <FaMapMarkerAlt style={{ fontSize: "35" }} />
                {/* Map */}
            </Link>
        </nav>
    );
}

export default Navbar;
