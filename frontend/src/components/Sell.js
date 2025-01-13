import React, { useState, useEffect } from "react";
import axios from "axios";
import Sidebar from "./Sidebar";
import "./css/Sell.css";

const token = localStorage.getItem("token");

const Sell = () => {
  const [shiftContent, setShiftContent] = useState(false);
  const [sells, setSells] = useState([]);
  const [todaySells, setTodaySells] = useState(0);
  const [totalSells, setTotalSells] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchDate, setSearchDate] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [categories, setCategories] = useState(["Electronics", "Furniture", "Groceries", "Clothing", "Miscellaneous"]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [successPopup, setSuccessPopup] = useState(false);
  const [newSell, setNewSell] = useState({
    buyerName: "",
    companyName: "",
    gstId:"",
    shippingAddress: "",
    location: "",
    productName: "",
    quantity: "",
    contactNumber: "",
    pricePerStock: "",
    dateAdded: "",
  });
  const [formError, setFormError] = useState({});
  const [modalSell, setModalSell] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

  useEffect(() => {
    const fetchSells = async () => {
      try {
        const response = await axios.get("http://localhost:8000/api/get_sells/", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const sellsData = response.data.sales;
        setSells(sellsData);

        const today = new Date().toISOString().split("T")[0];
        const todayCount = sellsData.filter((sell) => {
          if (!sell.dateAdded || isNaN(new Date(sell.dateAdded))) return false;
          return sell.dateAdded.startsWith(today);
        }).length;

        setTodaySells(todayCount);

        const totalRevenue = sellsData.reduce((acc, sell) => acc + parseFloat(sell.totalPrice), 0);
        setTotalSells(totalRevenue.toFixed(2));
      } catch (err) {
        console.error("Error fetching sells:", err);
      }
    };

    fetchSells();
  }, []);

  const handleAddSell = () => {
    setModalSell(null);
    setNewSell({
        buyerName: "",
        companyName: "",
        gstId:"",
        shippingAddress: "",
        location: "",
        productName: "",
        quantity: "",
        contactNumber: "",
        pricePerStock: "",
        
      dateAdded: new Date().toISOString().split("T")[0],
    });
    setShowModal(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (modalSell) setModalSell((prev) => ({ ...prev, [name]: value }));
    setNewSell((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    setFormError({});
    setSuccessPopup(false);

    const sellData = modalSell ? { ...newSell, ...modalSell } : newSell;

    const errors = {};
    if (!sellData.buyerName) errors.buyerName = "Buyer Name is required.";
    if (!sellData.companyName) errors.companyName = "Company Name is required.";
    if (!sellData.productName) errors.productName = "Product Name is required.";
    if (!sellData.gstId) errors.gstId = "Gst ID is required.";
    if (!sellData.shippingAddress) errors.shippingAddress = "Shipping Address is required.";
    if (!sellData.location) errors.location = "Location is required.";
    if (!sellData.quantity || isNaN(sellData.quantity) || sellData.quantity <= 0)
      errors.quantity = "Valid quantity is required.";
    if (!sellData.pricePerStock || isNaN(sellData.pricePerStock) || sellData.pricePerStock <= 0)
      errors.pricePerStock = "Valid price is required.";

    if (Object.keys(errors).length > 0) {
      setFormError(errors);
      return;
    }

    try {
      if (sellData.id) {
        await axios.put(
          `http://localhost:8000/api/update_sell/${sellData.id}/`,
          sellData,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        setSells((prevSells) =>
          prevSells.map((sell) =>
            sell.id === sellData.id ? { ...sell, ...sellData } : sell
          )
        );
      } else {
        const addedSell = {
          ...sellData,
          totalPrice: (sellData.quantity * sellData.pricePerStock).toFixed(2),
          category: selectedCategory || "Miscellaneous",
          dateAdded: sellData.dateAdded || new Date().toISOString(),
        };

        const response = await axios.post(
          "http://localhost:8000/api/add_sell/",
          addedSell,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        setSells((prevSells) => [
          ...prevSells,
          { id: response.data.id, ...addedSell },
        ]);
      }

      setSuccessPopup(true);
      setTimeout(() => setSuccessPopup(false), 3000);
      setShowModal(false);
      window.location.reload();
      setModalSell(null);
    } catch (err) {
      if (err.response?.status === 400) {
        setFormError({ server: err.response.data.error });
      } else {
        console.error("Error saving sell:", err);
      }
    }
  };

  const handleEditSell = (sell) => {
    console.log(sell)
    setModalSell(sell);
    setNewSell({
      buyerName: sell.buyerName || "",
      companyName: sell.companyName || "",
      gstId : sell.gstId || "",
      shippingAddress: sell.shippingAddress || "",
      location: sell.location || "",
      productName: sell.productName || "",
      quantity: sell.quantity || "",
      pricePerStock: sell.pricePerStock || "",
      contactNumber: sell.contactNumber || "",
      dateAdded: sell.dateAdded || new Date().toISOString().split("T")[0],
    });
    setShowModal(true);
  };

  const handleDeleteSell = (sellId) => {
    const sell = sells.find((sell) => sell.id === sellId);
    setConfirmDelete(sell);
  };

  const confirmDeleteSell = async () => {
    try {
      await axios.delete(`http://localhost:8000/api/delete_sell/${confirmDelete.id}/`, {
        data: {
          productName: confirmDelete.productName,
          quantity: confirmDelete.quantity,
        },
        headers: { Authorization: `Bearer ${token}` },
      });

      setSells(sells.filter((sell) => sell.id !== confirmDelete.id));
      setConfirmDelete(null);

      setSuccessPopup(true);
      setTimeout(() => setSuccessPopup(false), 3000);
    } catch (error) {
      console.error("Error deleting sell:", error);
    }
  };

  const filteredSells = sells.filter((sell) => {
    return (
      (!searchTerm || sell.productName.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (!searchDate || sell.dateAdded === searchDate)
    );
  });

  return (
    <div className="sell-page">
      <Sidebar toggleContentShift={setShiftContent} />
      <div className={`sell-content ${shiftContent ? "shift" : ""}`}>
        <h1>📦 Sell Entry</h1>

        {successPopup && (
          <div className="success-popup">
            <p>✔️ Operation completed successfully</p>
          </div>
        )}

        <div className="sell-containers">
          <div className="container blue">
            <h3>Today's Sells</h3>
            <p>{todaySells}</p>
          </div>
          <div className="container green">
            <h3>Today's Revenue</h3>
            <p>Rs.{totalSells}</p>
          </div>
        </div>

        <div className="filters">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="">Select Category</option>
            {categories.map((category, index) => (
              <option key={index} value={category}>
                {category}
              </option>
            ))}
          </select>
          <button onClick={handleAddSell} className="add-button">
            Add Sell
          </button>
        </div>

        <div className="sell-table-container">
          <table className="sell-table">
            <thead>
              <tr>
                <th>Sell ID</th>
                <th>Company Name</th>
                <th>Gst ID</th>
                <th>Product Name</th>
                <th>Quantity</th>
                <th>Price Per Stock</th>
                <th>Total Price</th>
                <th>Date Added</th>
                <th>Edit</th>
                <th>Delete</th>
              </tr>
            </thead>
            <tbody>
              {filteredSells.map((sell, index) => (
                <tr key={index}>
                  <td>#{sell.id}</td>
                  <td>{sell.companyName}</td>
                  <td>{sell.gstId}</td>
                  <td>{sell.productName}</td>
                  <td>{sell.quantity}</td>
                  <td>{sell.pricePerStock}</td>
                  <td>{sell.totalPrice}</td>
                  <td>
                    {sell.dateAdded
                      ? new Date(sell.dateAdded).toISOString().split("T")[0]
                      : "N/A"}
                  </td>
                  <td>
                    <span
                      className="edit-icon"
                      style={{ cursor: "pointer" }}
                      onClick={() => handleEditSell(sell)}
                    >
                      ✏️
                    </span>
                  </td>
                  <td>
                    <span
                      className="delete-icon"
                      style={{ cursor: "pointer" }}
                      onClick={() => handleDeleteSell(sell.id)}
                    >
                      🗑️
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {showModal && (
          <div className="modal-overlay">
            <div className="modal-content">
              <h3>{modalSell ? "Edit Sell" : "Add Sell"}</h3>
              <button
                className="close-btn"
                onClick={() => setShowModal(false)}
              >
                &times;
              </button>
              <input
                type="text"
                name="buyerName"
                value={modalSell ? modalSell.buyerName : newSell.buyerName}
                onChange={handleInputChange}
                placeholder="Buyer Name"
              />
              {formError.buyerName && (
                <p className="error-message">{formError.buyerName}</p>
              )}

              <input
                type="text"
                name="companyName"
                value={modalSell ? modalSell.companyName : newSell.companyName}
                onChange={handleInputChange}
                placeholder="Company Name"
              />
              {formError.companyName && (
                <p className="error-message">{formError.companyName}</p>
              )}
              <input
                type="text"
                name="gstId"
                value={modalSell ? modalSell.gstId : newSell.gstId}
                onChange={handleInputChange}
                placeholder="Gst Id "
              />
              {formError.companyName && (
                <p className="error-message">{formError.gstId}</p>
              )}

              <input
                type="text"
                name="shippingAddress"
                value={
                  modalSell
                    ? modalSell.shippingAddress
                    : newSell.shippingAddress
                }
                onChange={handleInputChange}
                placeholder="Shipping Address"
              />

              <input
                type="text"
                name="location"
                value={modalSell ? modalSell.location : newSell.location}
                onChange={handleInputChange}
                placeholder="Location"
              />

              <input
                type="text"
                name="productName"
                value={
                  modalSell ? modalSell.productName : newSell.productName
                }
                onChange={handleInputChange}
                placeholder="Product Name"
              />
              {formError.productName && (
                <p className="error-message">{formError.productName}</p>
              )}

              <input
                type="number"
                name="quantity"
                value={modalSell ? modalSell.quantity : newSell.quantity}
                onChange={handleInputChange}
                placeholder="Quantity"
              />
              {formError.quantity && (
                <p className="error-message">{formError.quantity}</p>
              )}

              <input
                type="number"
                name="pricePerStock"
                value={
                  modalSell ? modalSell.pricePerStock : newSell.pricePerStock
                }
                onChange={handleInputChange}
                placeholder="Price Per Stock"
              />
              {formError.pricePerStock && (
                <p className="error-message">{formError.pricePerStock}</p>
              )}

              <input
                type="text"
                name="contactNumber"
                value={
                  modalSell ? modalSell.contactNumber : newSell.contactNumber
                }
                onChange={handleInputChange}
                placeholder="Contact Number"
              />

              <input
                type="date"
                name="dateAdded"
                value={modalSell ? modalSell.dateAdded : newSell.dateAdded}
                onChange={handleInputChange}
              />

              <button className="submit-btn" onClick={handleSubmit}>
                Save Sell
              </button>

              {formError.server && (
                <p className="error-message">{formError.server}</p>
              )}
            </div>
          </div>
        )}

        {confirmDelete && (
          <div className="delete-modal-overlay">
            <div className="delete-modal-content">
              <h3>Are you sure you want to delete this Sell?</h3>
              <p>{confirmDelete.productName}</p>
              <button
                className="delete-btn"
                onClick={confirmDeleteSell}
              >
                Yes, Delete
              </button>
              <button
                className="cancel-btn"
                onClick={() => setConfirmDelete(null)}
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Sell;
