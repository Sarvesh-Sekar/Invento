import React, { useState, useEffect } from "react";
import axios from "axios";
import Sidebar from "./Sidebar";
import "./css/Inventory.css";

const token = localStorage.getItem("token");

const Inventory = () => {
  const [shiftContent, setShiftContent] = useState(false);
  
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [modalProduct, setModalProduct] = useState(null); // Tracks the product being added/edited
  const [showModal, setShowModal] = useState(false);
  const [otherCategory, setOtherCategory] = useState(false);
  const [formError, setFormError] = useState({});
  const [successPopup, setSuccessPopup] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);

  useEffect(() => {
    axios
      .get("http://localhost:8000/api/get_products", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => setProducts(res.data) + console.log(res.data))
      
      .catch((err) => console.error("Error fetching products:", err));

    axios
      .get("/api/categories")
      .then((res) => setCategories(res.data))
      .catch((err) => console.error("Error fetching categories:", err));
  }, []);

  const handleCloseModal = () => {
    setShowModal(false);
    setFormError({});
    // Reset the modal product
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setModalProduct((prev) => ({ ...prev, [name]: value }));
  };

  

  const handleSubmitModalProduct = async () => {
    setFormError({});
    setSuccessPopup(false);
  
    // Validate form inputs
    const errors = {};
    if (!modalProduct.name) errors.name = "Product name is required.";
    if (!modalProduct.category) errors.category = "Category is required.";
    if (Object.keys(errors).length > 0) {
      setFormError(errors);
      return;
    }
  
    try {
      if (modalProduct.id) {
        // Update existing product
        await axios.put(
          `http://localhost:8000/api/update_product/${modalProduct.id}`,
          modalProduct,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setProducts((prevProducts) =>
          prevProducts.map((prod) =>
            prod.id === modalProduct.id ? { ...prod, ...modalProduct } : prod
          )
        );
      } else {
        // Add new product
        const newProduct = {
          ...modalProduct,
          alertRate: modalProduct.alertRate || "0",
          stocks_available: modalProduct.stocks_available || 0,
          addedDate: new Date().toISOString(), // Current date
        };
  
        const response = await axios.post(
          "http://localhost:8000/api/add_product",
          newProduct,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
  
        // Append the new product to the state immediately
        const addedProduct = {
          id: response.data.id, // Assuming the server returns the new product's ID
          ...newProduct,
        };
  
        setProducts((prevProducts) => [...prevProducts, addedProduct]);
      }
  
      setSuccessPopup(true);
      setTimeout(() => setSuccessPopup(false), 3000);
      window.location.reload()
      handleCloseModal();
    } catch (error) {
      if (error.response?.status === 400) {
        setFormError({ server: error.response.data.error });
      } else {
        console.error("Error saving product:", error);
      }
    }
  };
  

 
  

 const handleEditProduct = (product) => {
  setModalProduct({
    id: product.id,
    name: product.name || "",
    category: product.category || "",
    stocks_available: product.stocks_available || 0,
    alertRate: product.alertRate || "0",
    addedDate: product.addedDate || "",
  });
  setShowModal(true);
};


  const handleDeleteProduct = (productId) => {
    const product = products.find((prod) => prod.id === productId);
    setConfirmDelete(product);
  };

  const confirmDeleteProduct = async () => {
    try {
      await axios.delete(
        `http://localhost:8000/api/delete_product/${confirmDelete.id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setProducts(products.filter((prod) => prod.id !== confirmDelete.id));
      setConfirmDelete(null);

      // Show success popup
      setSuccessPopup(true);
      setTimeout(() => setSuccessPopup(false), 3000);
    } catch (error) {
      console.error("Error deleting product:", error);
    }
  };

  return (
    <div className="inventory-page">
      <Sidebar toggleContentShift={setShiftContent} />
      <div className={`inventory-content ${shiftContent ? "shift" : ""}`}>
        <h1>📦 Inventory</h1>

        {/* Success Popup */}
        {successPopup && (
          <div className="success-popup">
            <p>✔️ Operation completed successfully</p>
          </div>
        )}

        {/* Containers */}
        <div className="inventory-containers">
          <div className="container yellow">
            <h3>Products Available</h3>
            <p>{products.length}</p>
          </div>
          <div className="container purple">
            <h3>Categories</h3>
            <p>{categories.length}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="filters">
          <select>
            <option>Select by Category</option>
            {categories.map((category) => (
              <option key={category.id}>{category.name}</option>
            ))}
          </select>
          <select>
            <option>Select by Added Date</option>
            <option>Weekly</option>
            <option>Monthly</option>
            <option>Yearly</option>
          </select>
          <button onClick={() => setShowModal(true)}>Add Product</button>
        </div>

        {/* Table */}
        <table className="inventory-table">
          <thead>
            <tr>
              <th>Product ID</th>
              <th>Name</th>
              <th>Category</th>
              <th>Stocks Available</th>
              <th>Alert Rate</th>
              <th>Added Date</th>
              <th>Edit</th>
              <th>Delete</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.id}>
                <td>#{product.id}</td>
                <td>{product.name}</td>
                <td>{product.category}</td>
                <td>{product.stocks_available}</td>
                <td>{product.alertRate}</td>
                <td>{new Date(product.addedDate).toLocaleDateString()}</td>
                <td>
                  <span
                    className="edit-icon"
                    style={{ cursor: "pointer" }}
                    onClick={() => handleEditProduct(product)}
                  >
                    ✏️
                  </span>
                </td>
                <td>
                  <span
                    className="delete-icon"
                    style={{ cursor: "pointer" }}
                    onClick={() => handleDeleteProduct(product.id)}
                  >
                    🗑️
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Add/Edit Product Modal */}
        {showModal && (
          <div className="add-product-modal">
            <div className="modal-content">
              <h3>{modalProduct? "Edit Product" : "Add Product"}</h3>
              <button className="close-btn" onClick={handleCloseModal}>
                &times;
              </button>
              <input
                type="text"
                name="name"
                value={modalProduct?.name || ""}
                onChange={handleInputChange}
                placeholder="Product Name"
              />
              {formError.name && <p className="error-message">{formError.name}</p>}
              <select
  name="category"
  value={modalProduct?.category || ""} // Use the category field of modalProduct
  onChange={(e) => {
    const value = e.target.value;
    setModalProduct((prev) => ({
      ...prev,
      category: value === "Other" ? "" : value,
    }));
    setOtherCategory(value === "Other");
  }}
>
  <option value="">Select Category</option>
  {categories.map((category) => (
    <option key={category.id} value={category.name}>
      {category.name}
    </option>
  ))}
  <option value="Home Goods">Home Goods</option>
  <option value="Electronics">Electronics</option>
  <option value="Electrical Appliances">Electrical Appliances</option>
  <option value="Medical">Medical</option>
  <option value="Fabrics">Fabrics</option>
  <option value="Other">Other</option>
</select>
{formError.category && (
  <p className="error-message">{formError.category}</p>
)}
{otherCategory && (
  <input
    type="text"
    name="customCategory"
    value={modalProduct?.category || ""}
    onChange={(e) =>
      setModalProduct((prev) => ({
        ...prev,
        category: e.target.value,
      }))
    }
    placeholder="Enter custom category"
  />
)}

              <input
                type="number"
                name="alertRate"
                value={modalProduct?.alertRate || ""}
                onChange={handleInputChange}
                placeholder="Alert Rate"
              />
              <button onClick={handleSubmitModalProduct}>
                {modalProduct?.id ? "Save" : "Add"}
              </button>
              <button className="cancel" onClick={handleCloseModal}>
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Confirm Delete Modal */}
        {confirmDelete && (
          <>
            <div
              className="modal-overlay"
              onClick={() => setConfirmDelete(null)}
            ></div>
            <div className="confirm-delete-modal">
              <div className="modal-content">
                <h3>Delete Product</h3>
                <p>
                  Are you sure you want to delete the product{" "}
                  <strong>{confirmDelete.name}</strong>?
                </p>
                <button
                  className="confirm"
                  onClick={() => confirmDeleteProduct(confirmDelete.id)}
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
        )}
      </div>
    </div>
  );
};

export default Inventory;
