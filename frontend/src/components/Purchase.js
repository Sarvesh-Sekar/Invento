import React, { useState, useEffect } from "react";
import axios from "axios";
import Sidebar from "./Sidebar";
import "./css/Purchase.css";

const token = localStorage.getItem("token");

const Purchase = () => {
  const [shiftContent, setShiftContent] = useState(false);
  const [purchases, setPurchases] = useState([]);
  const [todayPurchases, setTodayPurchases] = useState(0);
  const [totalPurchases, setTotalPurchases] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchDate, setSearchDate] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [categories, setCategories] = useState(["Electronics", "Furniture", "Groceries", "Clothing", "Miscellaneous"]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [successPopup, setSuccessPopup] = useState(false);
  const [newPurchase, setNewPurchase] = useState({
    sellerName: "",
    companyName: "",
    billingAddress: "",
    location: "",
    productName: "",
    quantity: "",
    contactNumber: "",
    pricePerStock: "",
    dateAdded: "",
  });
  const [formError, setFormError] = useState({});
  const [modalPurchase, setModalPurchase] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

  useEffect(() => {
    const fetchPurchases = async () => {
      try {
        const response = await axios.get("http://localhost:8000/api/get_purchases/", {
          headers: { Authorization: `Bearer ${token}` },
        });
        

        console.log(response.data.purchases)
        const purchasesData = response.data.purchases;
        setPurchases(purchasesData);
       

        // Get today's date
        const today = new Date().toISOString().split("T")[0];
        const todayCount = purchasesData.filter((purchase) => {
          // Validate dateAdded
          if (!purchase.dateAdded || isNaN(new Date(purchase.dateAdded))) return false;
          return purchase.dateAdded.startsWith(today);
        }).length;

        setTodayPurchases(todayCount);

        // Calculate total price
        
        const totalPrice = purchasesData.reduce((acc, purchase) => acc + parseFloat(purchase.totalPrice), 0);
        setTotalPurchases(totalPrice.toFixed(2));

      } catch (err) {
        console.error("Error fetching purchases:", err);
      }
    };

    fetchPurchases();
  }, []);

  const handleAddPurchase = () => {
    setModalPurchase(null)
    setNewPurchase({
      sellerName: "",
      companyName: "",
      gstId:"",
      billingAddress: "",
      location: "",
      productName: "",
      quantity: "",
      pricePerStock: "",
      contactNumber: "",
      dateAdded: new Date().toISOString().split("T")[0],
    });
    setShowModal(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if(modalPurchase)setModalPurchase((prev) => ({ ...prev, [name]: value }));
    setNewPurchase((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    setFormError({});
    setSuccessPopup(false);
  
    // Merge modalPurchase into newPurchase if modalPurchase exists
    const purchaseData = modalPurchase ? { ...newPurchase, ...modalPurchase } : newPurchase;
  
    console.log("Purchase Data:", purchaseData);
  
    // Validate form inputs
    const errors = {};
    if (!purchaseData.sellerName) errors.sellerName = "Seller Name is required.";
    if (!purchaseData.companyName) errors.companyName = "Company Name is required.";
    if (!purchaseData.productName) errors.productName = "Product Name is required.";
    if (!purchaseData.gstId) errors.gstId = "Gst Id is required.";
    if (!purchaseData.quantity || isNaN(purchaseData.quantity) || purchaseData.quantity <= 0)
      errors.quantity = "Valid quantity is required.";
    if (!purchaseData.pricePerStock || isNaN(purchaseData.pricePerStock) || purchaseData.pricePerStock <= 0)
      errors.pricePerStock = "Valid price is required.";
  
    if (Object.keys(errors).length > 0) {
      setFormError(errors);
      return;
    }
  
    try {
      if (purchaseData.id) {
        // Update existing purchase using PUT
        await axios.put(
          `http://localhost:8000/api/update_purchase/${purchaseData.id}/`,
          purchaseData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
  
        // Update the purchase in the state
        setPurchases((prevPurchases) =>
          prevPurchases.map((purchase) =>
            purchase.id === purchaseData.id ? { ...purchase, ...purchaseData } : purchase
          )
        );
      } else {
        // Add new purchase using POST
        const addedPurchase = {
          ...purchaseData,
          totalPrice: (purchaseData.quantity * purchaseData.pricePerStock).toFixed(2),
          category: selectedCategory || "Miscellaneous", // Default category if not selected
          dateAdded: purchaseData.dateAdded || new Date().toISOString(),
        };
  
        const response = await axios.post(
          "http://localhost:8000/api/add_purchase/",
          addedPurchase,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
  
        // Append the new purchase to the state
        setPurchases((prevPurchases) => [
          ...prevPurchases,
          { id: response.data.id, ...addedPurchase },
        ]);
      }
  
      // Reset modal and show success popup
      setSuccessPopup(true);
      setTimeout(() => setSuccessPopup(false), 3000);
      setShowModal(false);
      window.location.reload(); 
      setModalPurchase(null);
    } catch (err) {
      if (err.response?.status === 400) {
        setFormError({ server: err.response.data.error });
      } else {
        console.error("Error saving purchase:", err);
      }
    }
  };
  
  

  const handleEditPurchase = (purchase) => {
    setModalPurchase(purchase);
    setNewPurchase({
      sellerName: purchase.sellerName || "",
      companyName: purchase.companyName || "",
      gstId :purchase.gstId || "",
      billingAddress: purchase.billingAddress || "",
      location: purchase.location || "",
      productName: purchase.productName || "",
      quantity: purchase.quantity || "",
      pricePerStock: purchase.pricePerStock || "",
      contactNumber: purchase.contactNumber || "",
      dateAdded: purchase.dateAdded || new Date().toISOString().split("T")[0],
    });
    setShowModal(true);
  };
  

  const handleDeletePurchase = (purchaseId) => {
    const purchase = purchases.find((purchase) => purchase.id === purchaseId);
    setConfirmDelete(purchase);
  };

  const confirmDeletePurchase = async () => {
    try {
      await axios.delete(`http://localhost:8000/api/delete_purchase/${confirmDelete.id}/`,{
        data :{

        
          productName:confirmDelete.productName,
          quantity:confirmDelete.quantity,
        },
        headers: { Authorization: `Bearer ${token}` },
      });
      setPurchases(purchases.filter((purchase) => purchase.id !== confirmDelete.id));
      setConfirmDelete(null);

      setSuccessPopup(true);
      setTimeout(() => setSuccessPopup(false), 3000);
    } catch (error) {
      console.error("Error deleting purchase:", error);
    }
  };

  const filteredPurchases = purchases.filter((purchase) => {
    return (
      (!searchTerm || purchase.productName.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (!searchDate || purchase.dateAdded === searchDate)
    );
  });

  return (
    <div className="purchase-page">
      <Sidebar toggleContentShift={setShiftContent} />
      <div className={`purchase-content ${shiftContent ? "shift" : ""}`}>
        <h1>🛒 Purchase Entry</h1>

        {successPopup && (
          <div className="success-popup">
            <p>✔️ Operation completed successfully</p>
          </div>
        )}

        <div className="purchase-containers">
          <div className="container blue">
            <h3>Today's Purchases</h3>
            <p>{todayPurchases}</p>
          </div>
          <div className="container green">
            <h3>Today's OutFlow</h3>
            <p>Rs.{totalPurchases}</p>
          </div>
        </div>

        <div className="filters">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="">Select Category</option>
            {categories.map((category, index) => (
              <option key={index} value={category}>{category}</option>
            ))}
          </select>
          <select>
            <option>Select by Added Date</option>
            <option>Weekly</option>
            <option>Monthly</option>
            <option>Yearly</option>
          </select>
          <button onClick={handleAddPurchase} className="add-button">Add Purchase</button>
        </div>

        <div className="purchase-table-container">
          <table className="purchase-table">
            <thead>
              <tr>
                <th>Purchase ID</th>
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
              {filteredPurchases.map((purchase, index) => (
                <tr key={index}>
                  <td>#{purchase.id}</td>
                  <td>{purchase.companyName}</td>
                  <td>{purchase.gstId}</td>
                  <td>{purchase.productName}</td>
                  <td>{purchase.quantity}</td>
                  <td>{purchase.pricePerStock}</td>
                  <td>{purchase.totalPrice}</td>
                  <td>{purchase.dateAdded ? new Date(purchase.dateAdded).toISOString().split("T")[0] : "N/A"}</td>
                  <td>
                    <span className="edit-icon" style={{ cursor: "pointer" }} onClick={() => handleEditPurchase(purchase)}>✏️</span>
                  </td>
                  <td>
                    <span className="delete-icon" style={{ cursor: "pointer" }} onClick={() => handleDeletePurchase(purchase.id)}>🗑️</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {showModal && (
          <div className="modal-overlay">
            <div className="modal-content">
            <h3>{modalPurchase? "Edit Product" : "Add Product"}</h3>
              <button className="close-btn" onClick={() => setShowModal(false)}>&times;</button>
              <input
                type="text" 
                name="sellerName"
                value={modalPurchase?modalPurchase.sellerName:newPurchase.sellerName}
                onChange={handleInputChange}
                placeholder="Seller Name"
              />
              {formError.sellerName && <p className="error-message">{formError.sellerName}</p>}

              <input
                type="text"
                name="companyName"
                value={modalPurchase?modalPurchase.companyName:newPurchase.companyName}
                onChange={handleInputChange}
                placeholder="Company Name"
              />
              {formError.companyName && <p className="error-message">{formError.companyName}</p>}
              <input
                type="text"
                name="gstId"
                value={modalPurchase?modalPurchase.gstId:newPurchase.gstId}
                onChange={handleInputChange}
                placeholder="Gst Id"
              />
              {formError.gstId && <p className="error-message">{formError.gstId}</p>}

              <input
                type="text"
                name="billingAddress"
                value={modalPurchase?modalPurchase.billingAddress:newPurchase.billingAddress}
                onChange={handleInputChange}
                placeholder="Billing Address"
              />

              <input
                type="text"
                name="location"
                value={modalPurchase? modalPurchase.location:newPurchase.location}
                onChange={handleInputChange}
                placeholder="Location"
              />

              <input
                type="text"
                name="productName"
                value={modalPurchase?modalPurchase.productName:newPurchase.productName}
                onChange={handleInputChange}
                placeholder="Product Name"
              />
              {formError.productName && <p className="error-message">{formError.productName}</p>}

              <input
                type="number"
                name="quantity"
                value={modalPurchase?modalPurchase.quantity:newPurchase.quantity}
                onChange={handleInputChange}
                placeholder="Quantity"
              />
              {formError.quantity && <p className="error-message">{formError.quantity}</p>}

              <input
                type="number"
                name="pricePerStock"
                value={modalPurchase?modalPurchase.pricePerStock:newPurchase.pricePerStock}
                onChange={handleInputChange}
                placeholder="Price Per Stock"
              />
              {formError.pricePerStock && <p className="error-message">{formError.pricePerStock}</p>}

              <input
                type="number"
                name="contactNumber"
                value={modalPurchase?modalPurchase.contactNumber:newPurchase.contactNumber}
                onChange={handleInputChange}
                placeholder="Contact Number"
              />
              {formError.contactNumber && <p className="error-message">{formError.contactNumber}</p>}

              <input
                type="date"
                name="dateAdded"
                value={modalPurchase?modalPurchase.dateAdded:newPurchase.dateAdded}
                onChange={handleInputChange}
              />
              {formError.dateAdded && <p className="error-message">{formError.dateAdded}</p>}

             <button onClick={handleSubmit}>
                {modalPurchase?.id ? "Save" : "Add"}
              
             </button>
              <button className="cancel-btn" onClick={() => setShowModal(false)}>Cancel</button>
            </div>
          </div>
        )}

{
  confirmDelete && (
    <>
      <div
        className="modal-overlay"
        onClick={() => setConfirmDelete(null)}
      ></div>
      <div className="confirm-delete-modal">
        <div className="modal-content">
          <h3>Delete Product</h3>
          <p>
            Are you sure you want to delete the Purchase with id{" "}
            <strong>#{confirmDelete.id}</strong>?
          </p>
          <button
            className="confirm"
            onClick={() => confirmDeletePurchase(confirmDelete.id)}
          >
            Yes
          </button>
          <button
            className="cancel"
            onClick={() => setConfirmDelete(null)}
          >
            No
          </button>
        </div>
      </div>
    </>
  )
}

      </div>
    </div>
  );
};

export default Purchase;
