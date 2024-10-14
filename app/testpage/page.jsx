'use client';

import React, { useState } from 'react';

export default function ItemList() {
  // Initial list of items
  const [items, setItems] = useState([
    { id: 1, name: 'Item 1' },
    { id: 2, name: 'Item 2' },
    { id: 3, name: 'Item 3' },
    { id: 4, name: 'Item 4' },
  ]);

  // Track selected items
  const [selectedItems, setSelectedItems] = useState([]);

  // Handle checkbox change
  const handleCheckboxChange = (id) => {
    if (selectedItems.includes(id)) {
      setSelectedItems(selectedItems.filter((itemId) => itemId !== id));
    } else {
      setSelectedItems([...selectedItems, id]);
    }
  };

  // Handle deleting selected items
  const handleDelete = () => {
    const newItems = items.filter((item) => !selectedItems.includes(item.id));
    setItems(newItems);
    setSelectedItems([]); // Reset the selected items
  };

  return (
    <div className="container">
      <h1 className="text-xl font-bold mb-4">Item List</h1>
      <div className="item-list">
        {items.map((item) => (
          <div key={item.id} className="flex items-center space-x-4 mb-2">
            <input
              type="checkbox"
              checked={selectedItems.includes(item.id)}
              onChange={() => handleCheckboxChange(item.id)}
            />
            <div className="item-name">{item.name}</div>
          </div>
        ))}
      </div>
      {selectedItems.length > 0 && (
        <button
          onClick={handleDelete}
          className="mt-4 bg-red-500 text-white p-2 rounded"
        >
          Delete Selected
        </button>
      )}
    </div>
  );
}
