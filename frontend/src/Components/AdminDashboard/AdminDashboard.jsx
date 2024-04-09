import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './AdminDashboard.css';
import deleteIcon from '../../Assets/delete.png';
import { PRODUCT_URL } from '../../API/constants.js';
import axiosInstance from '../../API/axiosInstance.js'

function EditModal({ isOpen, onClose, product, onSave }) {
    const [editedProduct, setEditedProduct] = useState({});
    const [imageFile, setImageFile] = useState(null);

    useEffect(() => {
        if (product && isOpen) {
            const bottlesPerFlavorString = product.bottlesPerFlavor
                ? product.bottlesPerFlavor.map(bottle => `${bottle.flavor}: ${bottle.quantity}`).join('\n')
                : '';

            setEditedProduct({
                productImage: product.image || '',
                productName: product.productName || '',
                description: product.description || '',
                packageOption: product.packageOption || '',
                packageSize: product.packageSize || '',
                bottlesPerFlavor: bottlesPerFlavorString || '',
                price: product.price?.$numberDecimal?.toString() || '',
                inventory: product.currentInventory?.toString() || '',
                ingredients: product.ingredients || '',
                nutritionalInfo: product.nutritionalInfo || '',
            });
        }
    }, [product, isOpen]);

    const handleChange = (e) => {
        const { name, value } = e.target;

        // If the input is of type number and the value is negative, set it to 0
        if (e.target.type === 'number' && parseFloat(value) < 0) {
            return setEditedProduct(prevState => ({
                ...prevState,
                [name]: 0
            }));
        }

        // Otherwise, update the state normally
        setEditedProduct(prevState => ({
            ...prevState,
            [name]: value
        }));
    };


    const handleSubmit = () => {
        if (editedProduct.bottlesPerFlavor) {
            const bottlesPerFlavorArray = editedProduct.bottlesPerFlavor.split('\n').map(line => {
                const [flavor, quantity] = line.split(':').map(part => part.trim());
                return { flavor, quantity: parseInt(quantity, 10) };
            });


            const updatedProduct = { ...editedProduct, bottlesPerFlavor: bottlesPerFlavorArray };
            onSave(product.productId, product.packageId, updatedProduct);
        } else {
            onSave(product.productId, product.packageId, editedProduct);
        }
        handleImageUpload()
        onClose();
        setImageFile(null);
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        setImageFile(file);
    }

    const handleImageUpload = async () => {
        if (imageFile) {
            try {
                const formData = new FormData();
                formData.append('file', imageFile);
                const response = await fetch(`https://tobtf.onrender.com//api/upload/${product.productId}`, {
                    method: 'PUT',
                    body: formData,
                });
    
                if (!response.ok) {
                    throw new Error('Failed to upload image');
                }
    
                const imageUrl = await response.json();
                setEditedProduct(prevState => ({
                    ...prevState,
                    productImage: imageUrl,
                }));
            } catch (error) {
                console.error('Error uploading image:', error);
            }
        }
    }
    

    if (!isOpen) return null;

    return (
        <div className="modal">
            <div className="modal-content">
                <h2>Edit Product</h2>
                <table className="modal-table">
                    <tbody>
                        {Object.entries(editedProduct).map(([key, value]) => (
                            <tr key={key}>
                                <td>{key.charAt(0).toUpperCase() + key.slice(1)}:</td>
                                <td>
                                    {['productName', 'description', 'packageOption', 'bottlesPerFlavor', 'ingredients', 'nutritionalInfo'].includes(key) ? (
                                        <textarea
                                            name={key}
                                            value={value}
                                            onChange={handleChange}
                                            placeholder={`Enter ${key.charAt(0).toUpperCase() + key.slice(1)}`}
                                            rows="3"
                                        />
                                    ) : key === 'productImage' ? (
                                        <div>
                                            <input
                                                type="file"
                                                name={key}
                                                accept="image/"
                                                onChange={handleImageChange}
                                            />
                                        </div>

                                    ) : (
                                        <input
                                            type={key === 'price' || key === 'inventory' || key === 'packageSize' ? 'number' : 'text'}
                                            name={key}
                                            value={value}
                                            onChange={handleChange}
                                            placeholder={`Enter ${key.charAt(0).toUpperCase() + key.slice(1)}`}
                                            step={key === 'price' ? '0.01' : '1'}
                                        />
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                <div className='modal-buttons'>
                    <button className="modal-save-inventory-btn" onClick={handleSubmit}>SAVE</button>
                    <button className="modal-cancel-inventory-btn" onClick={onClose}>CANCEL</button>
                </div>
            </div>
        </div>
    );
}

function AddModal({ isOpen, onClose, onSave }) {
    const [newProduct, setNewProduct] = useState({
        productName: '',
        description: '',
        packageOption: '',
        packageSize: '',
        bottlesPerFlavor: '',
        price: '',
        inventory: '',
        ingredients: '',
        nutritionalInfo: '',
    });
    const [imageFile, setImageFile] = useState(null);

    // Reset input fields upon opening modal
    useEffect(() => {
        if (isOpen) {
            resetForm();
        }
    }, [isOpen]);

    const handleChange = (e) => {
        const { name, value } = e.target;

        // If the input is of type number and the value is negative, set it to 0
        if (e.target.type === 'number' && parseFloat(value) < 0) {
            return setNewProduct(prevState => ({
                ...prevState,
                [name]: 0
            }));
        }

        // Otherwise, update the state normally
        setNewProduct(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    const resetForm = () => {
        setNewProduct({
            productName: '',
            description: '',
            packageOption: '',
            packageSize: '',
            bottlesPerFlavor: '',
            price: '',
            inventory: '',
            ingredients: '',
            nutritionalInfo: '',
        });
        setImageFile(null);
    };

    const handleSubmit = () => {
        if (newProduct.bottlesPerFlavor) {
            const bottlesPerFlavorArray = newProduct.bottlesPerFlavor.split('\n').map(line => {
                const [flavor, quantity] = line.split(':').map(part => part.trim());
                return { flavor, quantity: parseInt(quantity, 10) };
            });


            const updatedProduct = { ...newProduct, bottlesPerFlavor: bottlesPerFlavorArray };
            onSave(updatedProduct);
        } else {
            onSave(newProduct);
        }
        onClose();
        resetForm();
    };


    if (!isOpen) return null;

    return (
        <div className="modal">
            <div className="modal-content">
                <h2>Add Product</h2>
                <table className="modal-table">
                    <tbody>
                        {Object.entries(newProduct).map(([key, value]) => (
                            <tr key={key}>
                                <td>{key.charAt(0).toUpperCase() + key.slice(1)}:</td>
                                <td>
                                    {['productName', 'description', 'packageOption', 'bottlesPerFlavor', 'ingredients', 'nutritionalInfo'].includes(key) ? (
                                        <textarea
                                            name={key}
                                            value={value}
                                            onChange={handleChange}
                                            placeholder={
                                                key === 'productName' ? "e.g., Sub-Reseller Package" :
                                                    key === 'description' ? "e.g., Discover convenience and profit with our..." :
                                                        key === 'packageOption' ? "e.g., Package A" :
                                                            key === 'bottlesPerFlavor' ? "<Flavor>: <Quantity> e.g.,\nClassic: 5\nSpicy: 5" :
                                                                key === 'ingredients' ? "e.g., Beef, Salt, Pepper..." :
                                                                    key === 'nutritionalInfo' ? "e.g., Placeholder" :
                                                                        "Placeholder"
                                            }
                                            rows="3"
                                        />
                                    ) : (
                                        <input
                                            type={key === 'price' || key === 'inventory' || key == 'packageSize' ? 'number' : 'text'}
                                            name={key}
                                            value={value}
                                            onChange={handleChange}
                                            placeholder={
                                                key === 'packageSize' ? "e.g., 330" :
                                                    key === 'price' ? "e.g., 1975.0" :
                                                        key === 'inventory' ? "e.g., 10" :
                                                            "Placeholder"
                                            }
                                            step={key === 'price' ? '0.01' : '1'}
                                        />
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                <div className='modal-buttons'>
                    <button className="modal-save-inventory-btn" onClick={handleSubmit}>SAVE</button>
                    <button className="modal-cancel-inventory-btn" onClick={onClose}>CANCEL</button>
                </div>
            </div>
        </div>
    );
}
const PopupMessage = ({ message, type }) => {
    return (
        <div className={`popup-message ${type}`}>
            <p>{message}</p>
        </div>
    );
};

const AdminDashboard = () => {
    const [products, setProducts] = useState([]);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [currentEditProduct, setCurrentEditProduct] = useState(null);
    const [filter, setFilter] = useState('');
    const [token, setToken] = useState(localStorage.getItem('jwt'));
    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const navigate = useNavigate();
    
    useEffect(() => {
        // Display success message for 3 seconds then clear it
        if (successMessage) {
            const timeout = setTimeout(() => {
                setSuccessMessage('');
            }, 3000);
            return () => clearTimeout(timeout);
        }
    }, [successMessage]);

    useEffect(() => {
        // Display error message for 3 seconds then clear it
        if (errorMessage) {
            const timeout = setTimeout(() => {
                setErrorMessage('');
            }, 3000);
            return () => clearTimeout(timeout);
        }
    }, [errorMessage]);
    
    useEffect(() => {
        // Check if there is a valid token in the local storage
        if (!token) {
            // Redirect to the login page if there is no token
            navigate('/login');
        }
    }, [token, navigate])

    // Effect for disabling/enabling body scroll
    useEffect(() => {
        const originalStyle = document.body.style.overflow;
        document.body.style.overflow = isEditModalOpen || isAddModalOpen ? 'hidden' : 'auto';
        return () => {
            document.body.style.overflow = originalStyle;
        };
    }, [isEditModalOpen, isAddModalOpen]);

    const handleDelete = async (productId, packageId) => {
        if (window.confirm('Are you sure you want to delete this product?')) {
            try {
                const token = localStorage.getItem('jwt');
                const response = await axiosInstance.delete(`${PRODUCT_URL}/remove/${productId}/${packageId}`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                });

                if (response.status === 200) {
                    setSuccessMessage(response.data.message);
                }

                console.log('Product deleted successfully');

                // Remove the deleted product from the products list
                setProducts(prevProducts => prevProducts.filter(product => !(product.productId === productId && product.packageId === packageId)));

                // Reset filter to show all products
                setFilter('');
            } catch (error) {
               setErrorMessage(error.response.data.message);
            }
        }
    };

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await axiosInstance.get(`${PRODUCT_URL}`);
                if (response.status === 200) {
                    const productsData = response.data;
                    const flattenedProducts = productsData.flatMap(product =>
                        product.packages.map(packageItem => ({
                            packageId: packageItem._id,
                            productId: product._id,
                            productName: product.name,
                            description: product.description,
                            packageOption: packageItem.packageOption,
                            packageSize: packageItem.packageSize,
                            bottlesPerFlavor: packageItem.bottlesPerFlavor,
                            price: packageItem.price,
                            currentInventory: packageItem.countInStock,
                            ingredients: product.ingredients,
                            nutritionalInfo: product.nutriInfo,
                            image: product.image,
                            imageId: product.imageId
                        }))
                    );
                    setProducts(flattenedProducts);
                } 
            } catch (error) {
                console.error('Error fetching products:', error);
            }
        };
        fetchProducts();
    }, [products]);

    const addNewProduct = () => {
        setIsAddModalOpen(true);
    };

    const navigateToProduct = (productId) => {
        window.location.href = `/products/${productId}`;
    };

    const startEdit = (product) => {
        setCurrentEditProduct(product);
        setIsEditModalOpen(true);
    };

    const saveEdits = async (productId, packageId, updatedProduct) => {
        try {
            const response = await axiosInstance.put(`${PRODUCT_URL}/${productId}/${packageId}`, JSON.stringify(updatedProduct), {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (response.status === 200)  {
                setSuccessMessage(response.data.message)

                setIsEditModalOpen(false);
            }
        } catch (error) {
            setErrorMessage(error.response.data.message)
        }
    };

    const handleAddProduct = async (newProductData) => {
        try {
            // Send the new product data to the server
            const response = await axiosInstance.post(`${PRODUCT_URL}/add`, JSON.stringify(newProductData), {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (response.status === 201) {
                const updatedProducts = response.data.product;
                const message = response.data.message;
                setProducts([...products, updatedProducts]);
                setSuccessMessage(message);
            }
           
            // Close the modal after saving
            setIsAddModalOpen(false);
        } catch (error) {
            setErrorMessage(error.response.data.message);
        }
    };

    // Unique product names for the filter dropdown
    const productNames = [...new Set(products.map(product => product.productName))];

    // Filter products based on the selected product name
    const filteredProducts = products.filter(product => 
        filter === '' || product.productName === filter
    );

    return (
        <div className="admin-grid-container">
            <div className="admin-elements-container">
                <h1 className="dashboard-title">
                    Product Management
                    <span className="admin-filter-dropdown">
                        Filter:
                        <select 
                            value={filter}
                            onChange={e => setFilter(e.target.value)}
                        >
                            <option value="">All Products</option>
                            {productNames.map(name => (
                                <option key={name} value={name}>{name}</option>
                            ))}
                        </select>
                    </span>
                </h1>
            {successMessage && <PopupMessage message={successMessage} type="success" />}
            {errorMessage && <PopupMessage message={errorMessage} type="error" />}
                <div className="admin-grid-product">
                    <div className="admin-cart-container">
                        <div className="admin-flex-container">
                            <div className="admin-product-container">
                                {filteredProducts.map((product) => (
                                    <div key={product.packageId} className="item">
                                        <img src={`https://tobtf.onrender.com//${product.image}`} alt={product.productName} />
                                        <div className="admin-product-details">
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <p>{product.productName} [{product.packageOption}]</p>
                                                <div className="product-action-buttons">
                                                    <button
                                                        className="open-product-btn"

                                                        onClick={() => navigateToProduct(product.productId)}
                                                    >
                                                        OPEN
                                                    </button>
                                                    <button
                                                        className="admin-delete-btn"
                                                        style={{ float: 'right' }}
                                                        onClick={() => handleDelete(product.productId, product.packageId)}
                                                    >
                                                        <img src={deleteIcon} alt="delete" />
                                                    </button>
                                                </div>
                                            </div>
                                            <div className="admin-price-quantity-container">
                                                <div className="admin-price-container">
                                                    <div className="admin-price-quantity">
                                                        <p>Price: </p>
                                                    </div>
                                                    <div className="admin-price-value">
                                                        <span>{parseFloat(product.price?.$numberDecimal)?.toLocaleString('en-PH', { style: 'currency', currency: 'PHP' })}</span>
                                                    </div>
                                                </div>
                                                <div className="admin-quantity-container">
                                                    <div className="admin-price-quantity">
                                                        <p>Inventory: </p>
                                                    </div>
                                                    <div className="admin-quantity-value">
                                                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                            <span style={{ marginTop: '2px' }}>{product.currentInventory}</span>
                                                            <button
                                                                className="edit-inventory-btn"
                                                                style={{ marginRight: '3px' }}
                                                                onClick={() => startEdit(product)}
                                                            >
                                                                EDIT
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <button className="add-product-btn add-btn" onClick={addNewProduct}>+ Add Product</button>
                    </div>
                </div>
            </div>
            <EditModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                product={currentEditProduct}
                onSave={saveEdits}
            />
            <AddModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onSave={handleAddProduct}
            />
        </div>
    );
};

export default AdminDashboard;
