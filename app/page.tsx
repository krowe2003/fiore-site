"use client";
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

      <h1 style={{ color: "red" }}>Fiore Electrical Supply</h1>

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
                  >
                    Add
                  </button>
                </div>
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
            <option>Parts</option>
            <option>Equipment</option>
            <option>Vehicles</option>
          </select>

          <input placeholder="Product Name" value={newName} onChange={(e) => setNewName(e.target.value)} style={inputStyle} />
          <input placeholder="Sizes" value={newSizes} onChange={(e) => setNewSizes(e.target.value)} style={inputStyle} />

          <input placeholder="Image URL (optional)" value={newImage} onChange={(e) => setNewImage(e.target.value)} style={inputStyle} />

          <input type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] || null)} />

          <button onClick={addProduct}>Add Product</button>
        </div>
      )}
    </div>
  );
}