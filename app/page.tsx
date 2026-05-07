"use client";
<<<<<<< HEAD
import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const inputStyle = {
  background: "#f5f5f5",
  color: "#000",
  padding: "10px",
  borderRadius: "6px",
  border: "1px solid #ccc",
  width: "100%",
  marginBottom: "10px"
};

type Item = {
  id: number;
  name: string;
  sizes: string[];
  category: string;
  image?: string;
};

export default function Home() {
  const [items, setItems] = useState<Item[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("Parts");
  const [cart, setCart] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const [user, setUser] = useState<any>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // 🔥 NEW: hide login unless ?admin=true
  const [showAdminLogin, setShowAdminLogin] = useState(false);

  const [newName, setNewName] = useState("");
  const [newSizes, setNewSizes] = useState("");
  const [newCategory, setNewCategory] = useState("Parts");
  const [newImage, setNewImage] = useState("");
  const [file, setFile] = useState<File | null>(null);

  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerNotes, setCustomerNotes] = useState("");

  const categories = ["Parts", "Equipment", "Vehicles"];

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("admin") === "true") {
      setShowAdminLogin(true);
    }

    const getUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data.user);
    };

    getUser();
    fetchProducts();

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
      }
    );

    return () => listener.subscription.unsubscribe();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);

    const { data, error } = await supabase.from("products").select("*");
    if (error) return alert(error.message);

    if (data) {
      setItems(
        data.map((item: any) => ({
          id: item.id,
          name: item.name,
          sizes: item.sizes ? item.sizes.split(",") : [],
          category: item.category || "Parts",
          image: item.image || ""
        }))
      );
    }

    setLoading(false);
  };

  const login = async () => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    if (error) alert(error.message);
    else setUser(data.user);
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  const uploadImage = async () => {
    if (!file) return null;

    const fileName = `${Date.now()}-${file.name}`;

    const { error } = await supabase.storage
      .from("product-images")
      .upload(fileName, file);

    if (error) {
      alert("Upload failed");
      return null;
    }

    const { data } = supabase.storage
      .from("product-images")
      .getPublicUrl(fileName);

    return data.publicUrl;
  };

  const addProduct = async () => {
    if (!user) return alert("Login required");
    if (!newName) return alert("Enter a name");

    let imageUrl = newImage;

    if (file) {
      const uploaded = await uploadImage();
      if (uploaded) imageUrl = uploaded;
    }

    const { error } = await supabase.from("products").insert([
      {
        name: newName,
        sizes: newSizes,
        category: newCategory,
        image: imageUrl
      }
    ]);

    if (error) return alert(error.message);

    setNewName("");
    setNewSizes("");
    setNewImage("");
    setFile(null);

    fetchProducts();
  };

  const deleteProduct = async (id: number) => {
    await supabase.from("products").delete().eq("id", id);
    fetchProducts();
  };

  const addToCart = (name: string, size: string) => {
    setCart((prev) => [...prev, `${name} (${size})`]);
  };

  const removeFromCart = (index: number) => {
    setCart((prev) => prev.filter((_, i) => i !== index));
  };

  const sendQuote = () => {
    if (cart.length === 0) return alert("No items");

    const body = `
Name: ${customerName}
Email: ${customerEmail}

Items:
${cart.join("\n")}

Notes:
${customerNotes}
`;

    window.location.href = `mailto:fioreelectrical@gmail.com?subject=Quote Request&body=${encodeURIComponent(body)}`;
  };

  return (
    <div style={{ background: "black", color: "white", minHeight: "100vh", padding: "20px" }}>

      <h1 style={{ color: "red" }}>Fiore Electrical Inc.</h1>

      {/* 🔥 LOGIN HIDDEN UNLESS ?admin=true */}
      {showAdminLogin && !user && (
        <div>
          <input placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} style={inputStyle} />
          <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} style={inputStyle} />
          <button onClick={login}>Login</button>
        </div>
      )}

      {user && <button onClick={logout}>Logout</button>}

      {/* CATEGORY TABS */}
      <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            style={{
              padding: "10px",
              background: selectedCategory === cat ? "red" : "gray",
              color: "white",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer"
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      {loading && <p>Loading...</p>}

      {!loading &&
        items
          .filter((item) => item.category === selectedCategory)
          .map((item) => (
            <div
              key={item.id}
              style={{
                border: "1px solid blue",
                padding: "10px",
                marginTop: "10px",
                borderRadius: "8px"
              }}
            >
              {item.image && (
                <img src={item.image} style={{ width: "200px" }} />
              )}

              <h3>
                {item.image ? (
                  <a href={item.image} target="_blank" rel="noopener noreferrer" style={{ color: "inherit", textDecoration: "underline" }}>
                    {item.name}
                  </a>
                ) : (
                  item.name
                )}
              </h3>

              {item.sizes.map((size, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "5px"
                  }}
                >
                  <span>{size}</span>

                  <button
                    onClick={() => addToCart(item.name, size)}
                    style={{
                      background: "red",
                      color: "white",
                      border: "none",
                      padding: "5px 10px",
                      borderRadius: "4px",
                      cursor: "pointer"
                    }}
=======
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
>>>>>>> c4b59f4ec6b6560d07cad7033459e29529a8832d
                  >
                    Add
                  </button>
                </div>
<<<<<<< HEAD
              ))}

              {user && <button onClick={() => deleteProduct(item.id)}>Delete</button>}
            </div>
          ))}

      <h2>Quote</h2>

      {cart.map((c, i) => (
        <div key={i}>
          {c}
          <button onClick={() => removeFromCart(i)}>X</button>
        </div>
      ))}

      <input placeholder="Name" value={customerName} onChange={(e) => setCustomerName(e.target.value)} style={inputStyle} />
      <input placeholder="Email" value={customerEmail} onChange={(e) => setCustomerEmail(e.target.value)} style={inputStyle} />
      <textarea placeholder="Notes" value={customerNotes} onChange={(e) => setCustomerNotes(e.target.value)} style={inputStyle} />

      <button onClick={sendQuote}>Send Quote</button>

      {user && (
        <div>
          <h2>Admin</h2>

          <select value={newCategory} onChange={(e) => setNewCategory(e.target.value)} style={inputStyle}>
=======
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
>>>>>>> c4b59f4ec6b6560d07cad7033459e29529a8832d
            <option>Parts</option>
            <option>Equipment</option>
            <option>Vehicles</option>
          </select>

<<<<<<< HEAD
          <input placeholder="Product Name" value={newName} onChange={(e) => setNewName(e.target.value)} style={inputStyle} />
          <input placeholder="Sizes" value={newSizes} onChange={(e) => setNewSizes(e.target.value)} style={inputStyle} />

          <input placeholder="Image URL (optional)" value={newImage} onChange={(e) => setNewImage(e.target.value)} style={inputStyle} />

          <input type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] || null)} />

          <button onClick={addProduct}>Add Product</button>
        </div>
      )}
=======
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

>>>>>>> c4b59f4ec6b6560d07cad7033459e29529a8832d
    </div>
  );
}