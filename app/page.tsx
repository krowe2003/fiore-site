"use client";
import { useState } from "react";

type Item = { name: string; sizes: string[] };
type Categories = { [key: string]: Item[] };

export default function FioreElectrical() {
  const [categories, setCategories] = useState<Categories>({
    Parts: [
      {
        name: "Pipe Clamps",
        sizes: ['1/2"', '1"', '1 1/4"', '1 1/2"', '2"', '2 1/2"', '3"']
      },
      {
        name: "Set Screw Connectors",
        sizes: ['1/2"', '3/4"', '1"', '2"']
      },
      {
        name: "One Hole Straps",
        sizes: ['1/2"', '3/4"', '1"', '1 1/2"', '2"']
      },
      {
        name: "Set Screw Couplings",
        sizes: ['1/2"', '3/4"', '1"', '1 1/4"', '1 1/2"', '2"']
      },
      {
        name: "Conduit Hangers",
        sizes: ['3/4"', '1 1/4"', '1 1/2"', '2"']
      },
      {
        name: "Rain Tight Couplings",
        sizes: ['1/2"', '3/4"', '1"', '1 1/4"', '1 1/2"']
      },
      {
        name: "Compression Couplings",
        sizes: ['1/2"', '3/4"', '1 1/4"']
      },
      {
        name: "Rain Tight Compression Connector",
        sizes: ['1 1/2"']
      }
    ],
    Equipment: [],
    Vehicles: [
      { name: "Service Truck", sizes: [] }
    ]
  });

  const [selectedCategory, setSelectedCategory] = useState("Parts");
  const [cart, setCart] = useState<{ item: string; qty: string }[]>([]);
  const [form, setForm] = useState({ name: "", email: "" });
  const [isAdmin, setIsAdmin] = useState(false);

  // ADMIN INPUT STATE
  const [newName, setNewName] = useState("");
  const [newSizes, setNewSizes] = useState("");
  const [newCategory, setNewCategory] = useState("Parts");

  const addToCart = (item: string, size?: string) => {
    const label = size ? `${item} (${size})` : item;
    setCart([...cart, { item: label, qty: "" }]);
  };

  const submitQuote = () => {
    const body = `Quote Request:\n\nName: ${form.name}\nEmail: ${form.email}\n\nItems:\n${cart
      .map((c, i) => `${i + 1}. ${c.item} - Qty: ${c.qty || "N/A"}`)
      .join("\n")}`;

    window.location.href = `mailto:fioreelectricalinc@gmail.com?subject=Quote Request&body=${encodeURIComponent(body)}`;
  };

  const addProduct = () => {
    if (!newName) return;

    const sizes = newSizes
      ? newSizes.split(",").map((s) => s.trim())
      : [];

    setCategories({
      ...categories,
      [newCategory]: [
        ...categories[newCategory],
        { name: newName, sizes }
      ]
    });

    setNewName("");
    setNewSizes("");
  };

  const deleteProduct = (category: string, index: number) => {
    const updated = [...categories[category]];
    updated.splice(index, 1);

    setCategories({
      ...categories,
      [category]: updated
    });
  };

  return (
    <div className="min-h-screen bg-black text-white">

      {/* NAVBAR */}
      <nav className="bg-black border-b border-red-700 p-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <img src="/logo.png" className="h-10" />
          <h1 className="text-red-600 font-bold">FIORE ELECTRICAL INC.</h1>
        </div>

        <div className="flex gap-6">
          {Object.keys(categories).map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={selectedCategory === cat ? "text-blue-400" : ""}
            >
              {cat}
            </button>
          ))}

          <button
            onClick={() => {
              const pass = prompt("Enter admin password");
              if (pass === "fiore123") setIsAdmin(true);
            }}
            className="text-xs text-gray-400"
          >
            Admin
          </button>
        </div>
      </nav>

      {/* HERO */}
      <section className="bg-blue-900 text-center p-10">
        <h2 className="text-3xl text-red-600 font-bold">
          Wholesale Electrical Supplies
        </h2>
      </section>

      {/* PRODUCTS */}
      <section className="p-6 grid md:grid-cols-3 gap-6">
        {categories[selectedCategory].map((item, i) => (
          <div key={i} className="border border-blue-700 p-4 rounded">
            <h3 className="font-bold">{item.name}</h3>

            {item.sizes.length > 0 ? (
              item.sizes.map((size, idx) => (
                <div key={idx} className="flex justify-between">
                  <span>{size}</span>
                  <button
                    onClick={() => addToCart(item.name, size)}
                    className="bg-red-700 px-2 text-xs"
                  >
                    Add
                  </button>
                </div>
              ))
            ) : (
              <button
                onClick={() => addToCart(item.name)}
                className="bg-red-700 px-2 text-xs mt-2"
              >
                Add to Quote
              </button>
            )}

            {isAdmin && (
              <button
                onClick={() => deleteProduct(selectedCategory, i)}
                className="mt-2 bg-gray-700 px-2 text-xs"
              >
                Delete
              </button>
            )}
          </div>
        ))}
      </section>

      {/* QUOTE */}
      <section className="p-6 border-t border-red-700">
        {cart.map((c, i) => (
          <div key={i}>
            {c.item}
            <input
              placeholder="Qty"
              className="ml-2 text-black"
              onChange={(e) => {
                const updated = [...cart];
                updated[i].qty = e.target.value;
                setCart(updated);
              }}
            />
          </div>
        ))}

        <input
          placeholder="Name"
          className="text-black block mt-2"
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />

        <input
          placeholder="Email"
          className="text-black block mt-2"
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />

        <button onClick={submitQuote} className="bg-blue-700 mt-2 px-4">
          Submit Quote
        </button>
      </section>

      {/* ADMIN PANEL */}
      {isAdmin && (
        <section className="p-6 border-t border-blue-800">
          <h2 className="text-red-600">Admin Panel</h2>

          <select
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            className="text-black block mb-2"
          >
            <option>Parts</option>
            <option>Equipment</option>
            <option>Vehicles</option>
          </select>

          <input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Product Name"
            className="text-black block mb-2"
          />

          <input
            value={newSizes}
            onChange={(e) => setNewSizes(e.target.value)}
            placeholder='Sizes (1/2",1",2")'
            className="text-black block mb-2"
          />

          <button onClick={addProduct} className="bg-red-700 px-4">
            Add Product
          </button>
        </section>
      )}

    </div>
  );
}