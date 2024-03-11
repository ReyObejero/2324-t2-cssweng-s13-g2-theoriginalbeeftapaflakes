import React, { useState, useEffect } from 'react';
import './ProductPage.css';

import { PRODUCT_URL,
        CARTS_URL } from '../../API/constants';
import axiosInstance from '../../API/axiosInstance.js';
import Cart from '../Views/Cart/Cart.jsx';

const Product = () => {
    // Scroll to top on mount
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const [product, setProduct] = useState();
    const [selectedPackage, setSelectedPackage] = useState('');
    const [quantity, setQuantity] = useState(1);
    const [warningMessage, setWarningMessage] = useState('');
    const [showWarning, setShowWarning] = useState(false);

    useEffect(() => {
        const handleFetchProduct = async () => {
            try {
                const productId = window.location.pathname.split('/').pop();
                const response = await axiosInstance.get(`${PRODUCT_URL}/${productId}`, {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('jwt')}`,
                    },
                });

                if (response.status !== 200) {
                    throw new Error(response.data.error || 'Failed to fetch product');
                }

                setProduct(response.data);
            } catch (error) {
                console.error('Error fetching product:', error.message);
            }
        };

        handleFetchProduct();
    }, []);

    // Function to update the selected package
    const handlePackageSelection = (productpackage) => {
        setSelectedPackage((prevPackage) => (prevPackage === productpackage ? '' : productpackage));
        setShowWarning(false);
    };

    // Function to dynamically update price based on package
    const getPrice = (price) => {
        const numericPrice = parseFloat(price.$numberDecimal);
        return numericPrice.toLocaleString('en-PH', { style: 'currency', currency: 'PHP' });
    };

    // Function that displays an error message if the user hasn't selected a package
    // Function that adds the selected product to the cart
    
    const handleAddToCart = async () => {
        const token = localStorage.getItem('jwt');
        if (!token) {
            // Handle case where JWT token is not present
            console.error('JWT token not found in localStorage');
            return;
        }
        const productId = window.location.pathname.split('/').pop();
        const packageData = product.packages.find((pkg) => pkg.packageOption === selectedPackage)
        if (!selectedPackage) {
            setWarningMessage('Please select a package');
            setShowWarning(true);
        } else {
            setShowWarning(false); // Reset warning message
            try {
                // Prepare the cart item data
                const cartItem = {
                    product: productId,
                    name: product.name,
                    selectedPackage: selectedPackage,
                    packageSize: packageData.packageSize,
                    price: packageData.price,
                    quantity: quantity,
                };
                // Make a POST request to add the item to the cart
                const response = await axiosInstance.post(`${CARTS_URL}/add`, cartItem, {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                    },
                });

                // Check if the request was successful
                if (response.status === 201) {
                    console.log('Product added to cart:', cartItem);
                    // TODO: show success mesage
                } else {
                    throw new Error(response.data.error || 'Failed to add product to cart');
                }
            } catch (error) {
                console.error('Error adding product to cart:', error.message);
                // Optionally, you can display an error message to the user
            }
        }
    };

    return (
        <div className="product-container">
            {product && (
                <div className="p-details-container">
                    <div className="p-image-gallery">
                        <img src={`http://localhost:5000/${product.image}`} alt={product.name} />
                    </div>
                    <div className="product-details">
                        <h1>{product.name}</h1>
                        <p className="p-amount">{product.totalBottles}</p>
                        <p className="p-price">
                            {selectedPackage ? getPrice(product.packages.find((pkg) => pkg.packageOption === selectedPackage).price) : 'Select a package'}
                        </p>
                        <div>
                            {product.packages.map((productpackage, index) => (
                                <button
                                    key={index}
                                    onClick={() => handlePackageSelection(productpackage.packageOption)}
                                    className={
                                        selectedPackage === productpackage.packageOption
                                            ? 'p-package-button selected'
                                            : 'p-package-button'
                                    }
                                >
                                    {productpackage.packageOption}
                                </button>
                            ))}
                        </div>
                        <ul>
                            {product.packages
                                .filter((pckg) => pckg.packageOption === selectedPackage)
                                .flatMap((pckg) =>
                                    pckg.bottlesPerFlavor.map((flavor, index) => (
                                        <li key={index}>
                                            {flavor.flavor}: {flavor.quantity}
                                        </li>
                                    ))
                                )}
                        </ul>
                        <h3>
                            Product Description:
                        </h3>
                        <p className="p-product-description" style={{ whiteSpace: 'pre-line' }}>
                            {product.description}
                        </p>
                        <div className="p-quantity-selector">
                            <label htmlFor="quantity">Quantity:</label>
                            <input
                                type="number"
                                id="quantity"
                                name="quantity"
                                min="1"
                                value={quantity}
                                onChange={(e) => setQuantity(parseInt(e.target.value, 10))}
                            />
                        </div>
                        {showWarning && <div className="p-error-bubble">{warningMessage}</div>}
                        <ul>
                            <li>Ingredients: {product.ingredients}</li>
                            <li>Nutritional Info: {product.nutriInfo}</li>
                        </ul>
                        <button className="p-add-to-cart" onClick={handleAddToCart}>
                            ADD TO CART
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Product;