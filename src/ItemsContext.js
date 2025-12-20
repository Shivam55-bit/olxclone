// ItemsContext.js
import React, { createContext, useContext, useState } from "react";

const ItemsContext = createContext();

export const ItemsProvider = ({ children }) => {
  const [items, setItems] = useState([
    {
      id: "1",
      title: "CCTV Camera",
      price: "6500",
      details: "4 Channel DVR • 2 Dome + 2 Bullet Cameras • Night Vision",
      image: "https://m.media-amazon.com/images/I/41WuCzy8yHL._SY355_.jpg",
      category: "CCTV",
    },
    {
      id: "2",
      title: "Honda Civic 2020",
      price: "950000",
      details: "Petrol • 15,000 km • First owner",
      image:
        "https://focus.independent.ie/thumbor/pZ36MM6K01uzmm8koRXgHnqrweA=/0x86:1500x913/960x640/prod-mh-ireland/54d1eedc-c059-11ed-a363-0210609a3fe2.JPG",
      category: "Cars",
    },
    {
      id: "3",
      title: "3BHK Apartment for Rent",
      price: "25000",
      details: "Bangalore • Fully Furnished • Near Metro",
      image:
        "https://imagecdn.99acres.com/media1/28763/10/575270355M-1741258171047.webp",
      category: "Properties",
    },
    {
      id: "4",
      title: "Mountain Bike",
      price: "18000",
      details: "21 gears • Disc brakes • Almost new",
      image:
        "https://encrypted-tbn1.gstatic.com/shopping?q=tbn:ANd9GcTZONO7L5KmuQs-Z5UOrVYK-t9qaSYrfrvpMRyslfVZGaUwecJn2V1FOxPZulG_TUR48-2SYPZbwQcw2_7T5FDh4D5wQBvNxlMVwOEa8ml3oD1fNgGiLmCK",
      category: "Bikes",
    },
    {
      id: "5",
      title: "Nike Air Max Shoes",
      price: "4500",
      details: "Size 9 • Brand New • Black & White",
      image:
        "https://image.goxip.com/J2t4TgukxSw9ya-8AemPI9bnT28=/fit-in/500x500/filters:format(jpg):quality(80):fill(white)/https:%2F%2Fimages.stockx.com%2Fimages%2FNike-Air-Max-95-OG-Crystal-Blue-Product.jpg",
      category: "Fashion",
    },
    {
      id: "6",
      title: "Samsung Smart Fridge",
      price: "32000",
      details: "Double Door • 1.5 Years Old • Warranty left",
      image:
        "https://images.samsung.com/is/image/samsung/p6pim/in/rs7hcg8543b1hl/gallery/in-side-by-side-family-hub-449420-rs7hcg8543b1hl-535087558?$684_547_PNG$",
      category: "Electronics",
    },
  ]);

  // ✅ Add new item
  const addItem = (item) => {
    setItems((prev) => [{ ...item, id: Date.now().toString() }, ...prev]);
  };

  // ✅ Remove item (optional helper)
  const removeItem = (id) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  return (
    <ItemsContext.Provider value={{ items, addItem, removeItem }}>
      {children}
    </ItemsContext.Provider>
  );
};

export const useItems = () => useContext(ItemsContext);
