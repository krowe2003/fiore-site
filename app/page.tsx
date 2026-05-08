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

type ProductSize = {
  size: string;
  price: number;
};

type Item = {
  id: number;
  name: string;
  sizes_json?: ProductSize[];
  sizes?: string[];
  category: string;
  image?: string;
};

export default function Home() {
  const [items, setItems] = useState<Item[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("Parts");
  const [cart, setCart] = useState<
  {
    name: string;
    size: string;
    price: number;
    quantity: number;
  }[]
>([]);
  const [loading, setLoading] = useState(true);

  const [user, setUser] = useState<any>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // 🔥 NEW: hide login unless ?admin=true
  const [showAdminLogin, setShowAdminLogin] = useState(false);

  const [newName, setNewName] = useState("");
  const [newSizes, setNewSizes] = useState<ProductSize[]>([
    { size: "", price: 0 }
  ]);
  const [newCategory, setNewCategory] = useState("Parts");
  const [newImage, setNewImage] = useState("");
  const [file, setFile] = useState<File | null>(null);

  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerNotes, setCustomerNotes] = useState("");
  const [search, setSearch] = useState("");
  const [cartOpen, setCartOpen] = useState(false);
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

  const { data, error } = await supabase
    .from("products")
    .select("*");

  if (error) {
    alert(error.message);
    setLoading(false);
    return;
  }

  if (data) {
    setItems(
      data.map((item: any) => ({
        id: item.id,
        name: item.name,

        // NEW JSON products
        sizes_json: item.sizes_json || [],

        // OLD legacy products
        sizes:
          typeof item.sizes === "string"
            ? item.sizes.split(",")
            : item.sizes || [],

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
      alert("clicked");

    console.log(newSizes);

    if (!user) return alert("Login required");
    if (!newName) return alert("Enter a name");

    let imageUrl = newImage;

    if (file) {
      const uploaded = await uploadImage();
      if (uploaded) imageUrl = uploaded;
    }

    console.log(newSizes);

    const { error } = await supabase.from("products").insert([
      {
        name: newName,
        sizes_json: newSizes,
        category: newCategory,
        image: imageUrl
      }
    ]);

    if (error) return alert(error.message);

    setNewName("");
    setNewSizes([{ size: "", price: 0 }]);
    setNewImage("");
    setFile(null);

    fetchProducts();
  };

  const deleteProduct = async (id: number) => {
    await supabase.from("products").delete().eq("id", id);
    fetchProducts();
  };

  const addToCart = (name: string, item: any) => {
  const size = item?.size || item;

  const price =
    item?.price !== undefined
      ? Number(item.price)
      : 0;

  setCart((prev) => {
    const existing = prev.find(
      (p) => p.name === name && p.size === size
    );

    if (existing) {
      return prev.map((p) =>
        p.name === name && p.size === size
          ? {
              ...p,
              quantity: p.quantity + 1
            }
          : p
      );
    }

    return [
      ...prev,
      {
        name,
        size,
        price,
        quantity: 1
      }
    ];
  });
};

  const removeFromCart = (index: number) => {
  setCart((prev) =>
    prev.filter((_, i) => i !== index)
  );
};

const sendQuote = () => {
  if (cart.length === 0) return alert("No items");

  const itemsText = cart
    .map(
      (item) =>
        `${item.name} (${item.size}) x${item.quantity} - $${(
          item.price * item.quantity
        ).toFixed(2)}`
    )
    .join("\n");

  const total = cart.reduce(
    (sum, item) =>
      sum + item.price * item.quantity,
    0
  );

  const body = `
Name: ${customerName}
Email: ${customerEmail}

Items:
${itemsText}

Estimated Total:
$${total.toFixed(2)}

Notes:
${customerNotes}
`;

  window.location.href =
    `mailto:fioreelectricalinc@gmail.com?subject=Quote Request&body=${encodeURIComponent(
      body
    )}`;
};
  return (
    <div style={{ background: "black", color: "white", minHeight: "100vh", padding: "20px" }}>

      <div
  style={{
    borderBottom: "2px solid #1d9bf0",
    paddingBottom: "20px",
    marginBottom: "30px"
  }}
>
  <h1
    style={{
      color: "#ff2b2b",
      fontSize: "42px",
      margin: 0,
      letterSpacing: "1px"
    }}
  >
    Fiore Electrical Supply
  </h1>

  <p
    style={{
      color: "#b0b0b0",
      marginTop: "10px",
      fontSize: "16px"
    }}
  >
    Professional Electrical Equipment & Supply
  </p>

<button
onClick={() => setCartOpen(true)}
  style={{
    position: "absolute",
    top: "30px",
    right: "30px",
    background: "#d10000",
    color: "white",
    border: "none",
    borderRadius: "10px",
    padding: "12px 18px",
    cursor: "pointer",
    fontWeight: "bold",
    boxShadow: "0 0 10px rgba(209,0,0,0.35)"
  }}
>
  🛒 Cart ({cart.length})
</button>
</div>

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
              background: selectedCategory === cat ? "#d10000" : "#10243d",
              color: "white",
              borderRadius: "10px",
              border: "1px solid #1e3a5f",
              cursor: "pointer"
            }}
          >
            {cat}
          </button>
        ))}
      </div>
      <input
  type="text"
  placeholder="Search products..."
  value={search}
  onChange={(e) => setSearch(e.target.value)}
  style={{
    width: "100%",
    padding: "12px",
    marginTop: "20px",
    marginBottom: "10px",
    borderRadius: "10px",
    border: "1px solid #1e3a5f",
    background: "#111827",
    color: "white",
    fontSize: "16px",
    outline: "none"
  }}
/>

      {loading && <p>Loading...</p>}

      {!loading && (
  <div
    style={{
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(280px, 320px))",
      justifyContent: "start",
      gap: "20px",
      marginTop: "20px"
    }}
  >
    {items
      .filter(
  (item) =>
    item.category === selectedCategory &&
    item.name.toLowerCase().includes(search.toLowerCase())
)
      .map((item) => (
        <div
              key={item.id}
              style={{
                  background: "#111827",
                  border: "1px solid #1e3a5f",
                  padding: "20px",
                  borderRadius: "18px",
                  boxShadow: "0 0 14px rgba(29, 155, 240, 0.12)",
                  transition: "0.2s ease",
                  display: "flex",
                  flexDirection: "column",
                  gap: "15px"
}}
            >
              {item.image && (
                <img
  src={item.image}
  style={{
    width: "100%",
    height: "300px",
    objectFit: "cover",
    borderRadius: "12px",
    border: "1px solid #1e3a5f",
  }}
/>
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

              {(item.sizes_json || item.sizes || []).map((s: any, i: number) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "8px",
                    gap: "10px"
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      gap: "15px",
                      alignItems: "center"
                    }}
                  >
                    <span>
                      {s?.size || s}
                    </span>

                    <span style={{ color: "#999" }}>
                        {s?.price !== undefined
                         ? `$${Number(s.price).toFixed(2)}`
                           : "$0.00"}
                    </span>
                  </div>

                  <button
                    onClick={() => addToCart(item.name, s)}
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
          </div>
      )}
    
      <div style={{ display: "none" }}>
      <h2>Quote</h2>

      {cart.map((item, i) => (
  <div
    key={i}
    style={{
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      background: "#111827",
      padding: "12px",
      borderRadius: "10px",
      marginBottom: "10px",
      border: "1px solid #1e3a5f"
      }}
  >
    <div>
      <div style={{ fontWeight: "bold" }}>
        {item.name}
      </div>

      <div style={{ color: "#b0b0b0", fontSize: "14px" }}>
        {item.size}
      </div>

      <div style={{ color: "#1d9bf0" }}>
        Qty: {item.quantity}
      </div>
    </div>

    <div style={{ textAlign: "right" }}>
      <div style={{ color: "#1d9bf0" }}>
        ${(item.price * item.quantity).toFixed(2)}
      </div>

      <button
        onClick={() => removeFromCart(i)}
        style={{
          marginTop: "5px",
          background: "#d10000",
          color: "white",
          border: "none",
          borderRadius: "6px",
          padding: "4px 8px",
          cursor: "pointer"
        }}
      >
        Remove
      </button>
    </div>
  </div>
))}

      <input placeholder="Name" value={customerName} onChange={(e) => setCustomerName(e.target.value)} style={inputStyle} />
      <input placeholder="Email" value={customerEmail} onChange={(e) => setCustomerEmail(e.target.value)} style={inputStyle} />
      <textarea placeholder="Notes" value={customerNotes} onChange={(e) => setCustomerNotes(e.target.value)} style={inputStyle} />

      <button onClick={sendQuote}>Send Quote</button>
      </div>
{cartOpen && (
  <div
    style={{
      position: "fixed",
      top: 0,
      right: 0,
      width: "400px",
      height: "100vh",
      background: "#111827",
      borderLeft: "2px solid #1e3a5f",
      padding: "20px",
      zIndex: 1000,
      overflowY: "auto",
      boxShadow: "-5px 0 20px rgba(0,0,0,0.4)"
    }}
  >
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "20px"
      }}
    >
      <h2>Quote Cart</h2>

      <button
        onClick={() => setCartOpen(false)}
        style={{
          background: "red",
          color: "white",
          border: "none",
          borderRadius: "6px",
          padding: "6px 10px",
          cursor: "pointer"
        }}
      >
        X
      </button>
    </div>

    {cart.map((item, i) => (
      <div
        key={i}
        style={{
          background: "#1a2332",
          padding: "12px",
          borderRadius: "10px",
          marginBottom: "10px",
          border: "1px solid #1e3a5f"
        }}
      >
        <div style={{ fontWeight: "bold" }}>
          {item.name}
        </div>

        <div style={{ color: "#b0b0b0" }}>
          {item.size}
        </div>

        <div style={{ color: "#1d9bf0" }}>
          Qty: {item.quantity}
        </div>

        <div style={{ marginTop: "5px" }}>
          ${(item.price * item.quantity).toFixed(2)}
        </div>

        <button
          onClick={() => removeFromCart(i)}
          style={{
            marginTop: "10px",
            background: "#d10000",
            color: "white",
            border: "none",
            borderRadius: "6px",
            padding: "5px 10px",
            cursor: "pointer"
          }}
        >
          Remove
        </button>
      </div>
    ))}

    <input
      placeholder="Name"
      value={customerName}
      onChange={(e) => setCustomerName(e.target.value)}
      style={inputStyle}
    />

    <input
      placeholder="Email"
      value={customerEmail}
      onChange={(e) => setCustomerEmail(e.target.value)}
      style={inputStyle}
    />

    <textarea
      placeholder="Notes"
      value={customerNotes}
      onChange={(e) => setCustomerNotes(e.target.value)}
      style={inputStyle}
    />
<div
  style={{
    marginTop: "20px",
    marginBottom: "15px",
    padding: "15px",
    background: "#1a2332",
    borderRadius: "10px",
    border: "1px solid #1e3a5f"
  }}
>
  <div
    style={{
      fontSize: "14px",
      color: "#b0b0b0",
      marginBottom: "5px"
    }}
  >
    Estimated Total
  </div>

  <div
    style={{
      fontSize: "28px",
      fontWeight: "bold",
      color: "#1d9bf0"
    }}
  >
    $
    {cart
      .reduce(
        (sum, item) =>
          sum + item.price * item.quantity,
        0
      )
      .toFixed(2)}
  </div>

  <div
    style={{
      marginTop: "10px",
      fontSize: "12px",
      color: "#888"
    }}
  >
    *Final Pricing will be confirmed upon quote review*
  </div>
</div>
    <button
      onClick={sendQuote}
      style={{
        width: "100%",
        background: "#d10000",
        color: "white",
        border: "none",
        padding: "12px",
        borderRadius: "10px",
        cursor: "pointer",
        fontWeight: "bold",
        marginTop: "10px"
      }}
    >
      Send Quote
    </button>
  </div>
)}
      {user && (
        <div>
          <h2>Admin</h2>

          <select value={newCategory} onChange={(e) => setNewCategory(e.target.value)} style={inputStyle}>
            <option>Parts</option>
            <option>Equipment</option>
            <option>Vehicles</option>
          </select>

          <input placeholder="Product Name" value={newName} onChange={(e) => setNewName(e.target.value)} style={inputStyle} />
          {newSizes.map((s, index) => (
  <div
    key={index}
    style={{
      display: "flex",
      gap: "10px",
      marginBottom: "10px",
      alignItems: "center"
    }}
  >
    <input
      placeholder="Size"
      value={s.size}
      onChange={(e) => {
        const updated = [...newSizes];
        updated[index].size = e.target.value;
        setNewSizes(updated);
      }}
      style={inputStyle}
    />

    <input
      type="number"
      placeholder="Price"
      value={s.price}
      onChange={(e) => {
        const updated = [...newSizes];
        updated[index].price = Number(e.target.value);
        setNewSizes(updated);
      }}
      style={inputStyle}
    />

    <button
      type="button"
      onClick={() => {
        setNewSizes(newSizes.filter((_, i) => i !== index));
      }}
      style={{
        background: "red",
        color: "white",
        border: "none",
        padding: "8px 12px",
        borderRadius: "6px",
        cursor: "pointer"
      }}
    >
      X
    </button>
  </div>
))}

<button
  type="button"
  onClick={() =>
    setNewSizes([
      ...newSizes,
      { size: "", price: 0 }
    ])
  }
  style={{
    background: "#444",
    color: "white",
    border: "none",
    padding: "10px",
    borderRadius: "6px",
    cursor: "pointer",
    marginBottom: "15px"
  }}
>
  + Add Size
</button>

          <input placeholder="Image URL (optional)" value={newImage} onChange={(e) => setNewImage(e.target.value)} style={inputStyle} />

          <input type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] || null)} />

          <button onClick={addProduct}>Add Product</button>
        </div>
      )}

    </div>
  );
}