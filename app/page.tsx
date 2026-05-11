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
  description?: string;
};

export default function Home() {
  const [items, setItems] = useState<Item[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("Parts");
  const [cart, setCart] = useState<
  {
    name: string;
    size: {
      size: string;
      price: number;
    };
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
  const [newDescription, setNewDescription] =
  useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [selectedProduct, setSelectedProduct] =
  useState<Item | null>(null);
  const [file, setFile] = useState<File | null>(null);

  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerNotes, setCustomerNotes] = useState("");
  const [search, setSearch] = useState("");
  const [cartOpen, setCartOpen] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [adminMessage, setAdminMessage] = useState("");
  const categories = ["Parts", "Equipment", "Vehicles"];

  useEffect(() => {
  const params = new URLSearchParams(window.location.search);

  const savedCart = localStorage.getItem("fiore-cart");

  if (savedCart) {
  const parsed = JSON.parse(savedCart);

  const normalized = parsed.map((item: any) => ({
    ...item,

    size:
      typeof item.size === "object"
        ? item.size
        : {
            size: item.size,
            price: item.price || 0
          }
  }));

  setCart(normalized);
}

  if (params.get("admin") === "true") {
    setShowAdminLogin(true);
  }

  const getUser = async () => {
    const { data } = await supabase.auth.getUser();
    setUser(data.user);
  };

  getUser();
  fetchProducts();
  setAdminMessage("✓ Product Deleted");

setTimeout(() => {
  setAdminMessage("");
}, 2000);

  const { data: listener } = supabase.auth.onAuthStateChange(
    (_event, session) => {
      setUser(session?.user ?? null);
    }
  );

  return () => listener.subscription.unsubscribe();
}, []);

useEffect(() => {
  localStorage.setItem(
    "fiore-cart",
    JSON.stringify(cart)
  );
}, [cart]); 

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
        image: item.image || "",
        description: item.description || ""
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

   let error;

if (editingId) {
  const result = await supabase
    .from("products")
    .update({
  name: newName,
  sizes_json: newSizes,
  category: newCategory,
  image: imageUrl,
  description: newDescription
})
    .eq("id", editingId);

  error = result.error;
} else {
  const result = await supabase
    .from("products")
    .insert([
      {
  name: newName,
  sizes_json: newSizes,
  category: newCategory,
  image: imageUrl,
  description: newDescription
}
    ]);

  error = result.error;
}

    if (error) return alert(error.message);
    setAdminMessage(
  editingId
    ? "✓ Product Updated"
    : "✓ Product Added"
);

setTimeout(() => {
  setAdminMessage("");
}, 2000);

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
const startEdit = (item: Item) => {
  setEditingId(item.id);

  setNewName(item.name);

  setNewCategory(item.category);

  setNewSizes(
    item.sizes_json || [
      { size: "", price: 0 }
    ]
  );

  setNewImage(item.image || "");
  setNewDescription(item.description || "");

  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
};
 const addToCart = (name: string, item: any) => {
  const sizeObj = {
    size:
      typeof item === "string"
        ? item
        : item.size,

    price:
      typeof item === "string"
        ? 0
        : Number(item.price)
  };

  setCart((prev) => {
    const existing = prev.find(
      (p) =>
        p.name === name &&
        p.size.size === sizeObj.size
    );

    if (existing) {
      return prev.map((p) =>
        p.name === name &&
        p.size.size === sizeObj.size
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
        size: sizeObj,
        price: sizeObj.price,
        quantity: 1
      }
    ];
  });

  setShowToast(true);

  setTimeout(() => {
    setShowToast(false);
  }, 2000);
};

  const removeFromCart = (index: number) => {
  setCart((prev) =>
    prev.filter((_, i) => i !== index)
  );
};

const increaseQuantity = (index: number) => {
  setCart((prev) =>
    prev.map((item, i) => {
      if (i !== index) return item;

      // prevent vehicle quantity above 1
      if (
      item.price > 10000 &&
      item.quantity >= 1
        ) {
  return item;
}

      return {
        ...item,
        quantity: item.quantity + 1
      };
    })
  );
};

const decreaseQuantity = (index: number) => {
  setCart((prev) =>
    prev
      .map((item, i) =>
        i === index
          ? {
              ...item,
              quantity: item.quantity - 1
            }
          : item
      )
      .filter((item) => item.quantity > 0)
  );
};

const sendQuote = () => {
  if (cart.length === 0) return alert("No items");

  const itemsText = cart
    .map(
      (item) =>
        `${item.name} (${item.size.size}) x${item.quantity} - $${(
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
    <div
  style={{
    background:
  `
  radial-gradient(circle at top left, rgba(209,0,0,0.18), transparent 28%),
  radial-gradient(circle at top right, rgba(29,155,240,0.12), transparent 30%),
  radial-gradient(circle at bottom center, rgba(255,255,255,0.03), transparent 35%),
  linear-gradient(to bottom, #111827 0%, #050505 55%, #000000 100%)
  `,
    color: "white",
    minHeight: "100vh",
    padding: "20px"
  }}
>
  <div
  style={{
    position: "fixed",
    top: "-200px",
    left: "-200px",
    width: "500px",
    height: "500px",
    background: "rgba(209,0,0,0.12)",
    filter: "blur(120px)",
    borderRadius: "50%",
    zIndex: 0,
    pointerEvents: "none"
  }}
/>

<div
  style={{
    position: "fixed",
    bottom: "-250px",
    right: "-200px",
    width: "500px",
    height: "500px",
    background: "rgba(29,155,240,0.10)",
    filter: "blur(140px)",
    borderRadius: "50%",
    zIndex: 0,
    pointerEvents: "none"
  }}
/>

      <div
  style={{
  borderBottom: "1px solid #1e3a5f",
  paddingBottom: "30px",
  marginBottom: "40px",
  background:
    "linear-gradient(to bottom, #111827, #000000)",
  borderRadius: "20px",
  padding: "30px",
  position: "relative",
  overflow: "hidden",
  boxShadow: "0 0 40px rgba(0,0,0,0.45)"
}}
>
  <div
  style={{
    display: "flex",
    alignItems: "center",
    gap: "20px"
  }}
>
  <img
    src="/logo.png"
    alt="Fiore Electrical Logo"
    style={{
  width: "130px",
  height: "130px",
  objectFit: "contain",
  filter:
    "drop-shadow(0 0 18px rgba(255,0,0,0.35))",
  zIndex: 2,
  position: "relative"
}}
  />

  <div>
    <h1
      style={{
        color: "#ff2b2b",
        fontSize: "48px",
        margin: 0,
        letterSpacing: "2px",
        fontWeight: "bold"
      }}
    >
      Fiore Electrical Supply
    </h1>

    <p
      style={{
        color: "#b0b0b0",
        marginTop: "8px",
        fontSize: "18px"
      }}
    >
      Commercial Electrical Equipment & Supply
    </p>
  </div>
</div>

<button
onClick={() => setCartOpen(true)}
onMouseEnter={(e) => {
  e.currentTarget.style.transform =
    "translateY(-2px) scale(1.02)";
}}

onMouseLeave={(e) => {
  e.currentTarget.style.transform =
    "translateY(0px) scale(1)";
}}
  style={{
    transition:
  "transform 0.2s ease, box-shadow 0.2s ease",
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

<div
  style={{
    marginBottom: "50px",
    padding: "50px 40px",
    position: "relative",
    overflow: "hidden",
    borderRadius: "24px",
    background:
      "linear-gradient(to right, #111827, #0a0a0a)",
    border: "1px solid #1e3a5f",
    boxShadow: "0 0 30px rgba(0,0,0,0.35)"
  }}
>
  <div
  style={{
    position: "absolute",
    inset: 0,
    backgroundImage:
      "linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)",
    backgroundSize: "40px 40px",
    opacity: 0.2,
    pointerEvents: "none"
  }}
/>
  <div
    style={{
      fontSize: "54px",
      fontWeight: "bold",
      lineHeight: "1.1",
      maxWidth: "850px",
      marginBottom: "20px"
    }}
  >
    Commercial Electrical Supply & Equipment
  </div>

  <div
    style={{
      color: "#b0b0b0",
      fontSize: "20px",
      maxWidth: "700px",
      lineHeight: "1.6",
      marginBottom: "30px"
    }}
  >
    Serving contractors, industrial projects,
    commercial businesses, and electrical
    professionals with reliable equipment and
    supply solutions.
  </div>

  <div
    style={{
      display: "flex",
      gap: "15px",
      flexWrap: "wrap"
    }}
  >
    <button
      onClick={() =>
        document
          .getElementById("products-section")
          ?.scrollIntoView({
            behavior: "smooth"
          })
      }
      onMouseEnter={(e) => {
  e.currentTarget.style.transform =
    "translateY(-2px) scale(1.02)";
}}

onMouseLeave={(e) => {
  e.currentTarget.style.transform =
    "translateY(0px) scale(1)";
}}
      style={{
        transition:
  "transform 0.2s ease, box-shadow 0.2s ease",
        background: "#d10000",
        color: "white",
        border: "none",
        padding: "14px 22px",
        borderRadius: "10px",
        fontWeight: "bold",
        cursor: "pointer",
        fontSize: "16px"
      }}
    >
      Browse Products
    </button>

    <button
      onClick={() => setCartOpen(true)}
      onMouseEnter={(e) => {
  e.currentTarget.style.transform =
    "translateY(-2px) scale(1.02)";
}}

onMouseLeave={(e) => {
  e.currentTarget.style.transform =
    "translateY(0px) scale(1)";
}}
      style={{
        transition:
  "transform 0.2s ease, box-shadow 0.2s ease",
        background: "#1e3a5f",
        color: "white",
        border: "none",
        padding: "14px 22px",
        borderRadius: "10px",
        fontWeight: "bold",
        cursor: "pointer",
        fontSize: "16px"
      }}
    >
      Open Quote Cart
    </button>
  </div>
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
            onMouseEnter={(e) => {
  e.currentTarget.style.transform =
    "translateY(-2px) scale(1.02)";
}}

onMouseLeave={(e) => {
  e.currentTarget.style.transform =
    "translateY(0px) scale(1)";
}}
            style={{
              transition:
  "transform 0.2s ease, box-shadow 0.2s ease",
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
        id="products-section"
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
  onClick={() => setSelectedProduct(item)}
  onMouseEnter={(e) => {
    e.currentTarget.style.transform =
      "translateY(-6px)";

    e.currentTarget.style.boxShadow =
      "0 0 30px rgba(29,155,240,0.18)";
  }}
  onMouseLeave={(e) => {
    e.currentTarget.style.transform =
      "translateY(0px)";

    e.currentTarget.style.boxShadow =
      "0 0 20px rgba(0,0,0,0.35)";
  }}
  style={{
  background: "rgba(17, 24, 39, 0.72)",
  backdropFilter: "blur(14px)",
  WebkitBackdropFilter: "blur(14px)",
  border: "1px solid rgba(255,255,255,0.08)",
  padding: "20px",
  borderRadius: "18px",
  boxShadow: "0 0 20px rgba(0,0,0,0.35)",
  transition:
  "transform 0.25s ease, box-shadow 0.25s ease, border 0.25s ease",
  cursor: "pointer",
  transform: "translateY(0px)",
  position: "relative",
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

              {(item.sizes_json || item.sizes || []).map(
  (s: any, i: number) => {
    const sizeObj =
      typeof s === "string"
        ? {
            size: s,
            price: 0
          }
        : s;

    return (
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
          <span>{sizeObj.size}</span>

          <span style={{ color: "#999" }}>
            ${Number(sizeObj.price).toFixed(2)}
          </span>
        </div>

        <button
          onClick={() =>
            addToCart(item.name, sizeObj)
          }
          onMouseEnter={(e) => {
            e.currentTarget.style.transform =
              "translateY(-2px) scale(1.02)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform =
              "translateY(0px) scale(1)";
          }}
          style={{
            transition:
              "transform 0.2s ease, box-shadow 0.2s ease",
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
    );
  }
)}

              {user && (
  <div
    style={{
      display: "flex",
      gap: "10px",
      marginTop: "10px"
    }}
  >
    <button
      onClick={() => startEdit(item)}
      onMouseEnter={(e) => {
  e.currentTarget.style.transform =
    "translateY(-2px) scale(1.02)";
}}

onMouseLeave={(e) => {
  e.currentTarget.style.transform =
    "translateY(0px) scale(1)";
}}
      style={{
        transition:
  "transform 0.2s ease, box-shadow 0.2s ease",
        background: "#1e3a5f",
        color: "white",
        border: "none",
        padding: "8px 12px",
        borderRadius: "6px",
        cursor: "pointer"
      }}
    >
      Edit
    </button>

    <button
      onClick={() => deleteProduct(item.id)}
      onMouseEnter={(e) => {
  e.currentTarget.style.transform =
    "translateY(-2px) scale(1.02)";
}}

onMouseLeave={(e) => {
  e.currentTarget.style.transform =
    "translateY(0px) scale(1)";
}}
      style={{
        transition:
  "transform 0.2s ease, box-shadow 0.2s ease",
        background: "#d10000",
        color: "white",
        border: "none",
        padding: "8px 12px",
        borderRadius: "6px",
        cursor: "pointer"
      }}
    >
      Delete
    </button>
  </div>
)}
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
        {item.size.size} — ${item.size.price}
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
        onMouseEnter={(e) => {
  e.currentTarget.style.transform =
    "translateY(-2px) scale(1.02)";
}}

onMouseLeave={(e) => {
  e.currentTarget.style.transform =
    "translateY(0px) scale(1)";
}}
        style={{
          transition:
  "transform 0.2s ease, box-shadow 0.2s ease",
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
  onMouseEnter={(e) => {
  e.currentTarget.style.transform =
    "translateY(-2px) scale(1.02)";
}}

onMouseLeave={(e) => {
  e.currentTarget.style.transform =
    "translateY(0px) scale(1)";
}}
    style={{
      transition:
  "transform 0.2s ease, box-shadow 0.2s ease",
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
        onMouseEnter={(e) => {
  e.currentTarget.style.transform =
    "translateY(-2px) scale(1.02)";
}}

onMouseLeave={(e) => {
  e.currentTarget.style.transform =
    "translateY(0px) scale(1)";
}}
        style={{
          transition:
  "transform 0.2s ease, box-shadow 0.2s ease",
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
  {item.size.size} — ${item.size.price}
</div>

       <div
  style={{
    display: "flex",
    alignItems: "center",
    gap: "10px",
    marginTop: "8px"
  }}
>
  <button
    onClick={() => decreaseQuantity(i)}
    onMouseEnter={(e) => {
  e.currentTarget.style.transform =
    "translateY(-2px) scale(1.02)";
}}

onMouseLeave={(e) => {
  e.currentTarget.style.transform =
    "translateY(0px) scale(1)";
}}
    style={{
      transition:
  "transform 0.2s ease, box-shadow 0.2s ease",
      background: "#222",
      color: "white",
      border: "none",
      borderRadius: "6px",
      width: "28px",
      height: "28px",
      cursor: "pointer",
      fontWeight: "bold"
    }}
  >
    −
  </button>

  <span style={{ color: "#1d9bf0", fontWeight: "bold" }}>
    {item.quantity}
  </span>

  <button
    onClick={() => increaseQuantity(i)}
    onMouseEnter={(e) => {
  e.currentTarget.style.transform =
    "translateY(-2px) scale(1.02)";
}}

onMouseLeave={(e) => {
  e.currentTarget.style.transform =
    "translateY(0px) scale(1)";
}}
    style={{
      transition:
  "transform 0.2s ease, box-shadow 0.2s ease",
      background: "#222",
      color: "white",
      border: "none",
      borderRadius: "6px",
      width: "28px",
      height: "28px",
      cursor: "pointer",
      fontWeight: "bold"
    }}
  >
    +
  </button>
</div>

        <div style={{ marginTop: "5px" }}>
          ${(item.price * item.quantity).toFixed(2)}
        </div>

        <button
          onClick={() => removeFromCart(i)}
          onMouseEnter={(e) => {
  e.currentTarget.style.transform =
    "translateY(-2px) scale(1.02)";
}}

onMouseLeave={(e) => {
  e.currentTarget.style.transform =
    "translateY(0px) scale(1)";
}}
          style={{
            transition:
  "transform 0.2s ease, box-shadow 0.2s ease",
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
      onMouseEnter={(e) => {
  e.currentTarget.style.transform =
    "translateY(-2px) scale(1.02)";
}}

onMouseLeave={(e) => {
  e.currentTarget.style.transform =
    "translateY(0px) scale(1)";
}}
      style={{
        transition:
  "transform 0.2s ease, box-shadow 0.2s ease",
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

{showToast && (
  <div
  onMouseEnter={(e) => {
  e.currentTarget.style.transform =
    "translateY(-2px) scale(1.02)";
}}

onMouseLeave={(e) => {
  e.currentTarget.style.transform =
    "translateY(0px) scale(1)";
}}
    style={{
      transition:
  "transform 0.2s ease, box-shadow 0.2s ease",
      position: "fixed",
      bottom: "30px",
      right: "30px",
      background: "rgba(17, 24, 39, 0.88)",
      backdropFilter: "blur(12px)",
      WebkitBackdropFilter: "blur(12px)",
      border: "1px solid rgba(255,255,255,0.08)",
      color: "white",
      padding: "14px 20px",
      borderRadius: "12px",
      boxShadow: "0 0 25px rgba(0,0,0,0.35)",
      zIndex: 5000,
      fontWeight: "bold"
    }}
  >
    ✓ Added to Quote Cart
  </div>
)}
{adminMessage && (
  <div
    style={{
      position: "fixed",
      top: "30px",
      right: "30px",
      background: "rgba(17, 24, 39, 0.92)",
      backdropFilter: "blur(14px)",
      WebkitBackdropFilter: "blur(14px)",
      border: "1px solid rgba(255,255,255,0.08)",
      color: "white",
      padding: "14px 20px",
      borderRadius: "12px",
      boxShadow: "0 0 25px rgba(0,0,0,0.35)",
      zIndex: 6000,
      fontWeight: "bold"
    }}
  >
    {adminMessage}
  </div>
)}
{selectedProduct && (
  <div
    onClick={() => setSelectedProduct(null)}
    style={{
      position: "fixed",
      inset: 0,
      background: "rgba(0,0,0,0.75)",
      backdropFilter: "blur(8px)",
      zIndex: 7000,
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      padding: "20px"
    }}
  >
    <div
      onClick={(e) => e.stopPropagation()}
      style={{
        background: "rgba(17,24,39,0.92)",
        backdropFilter: "blur(18px)",
        WebkitBackdropFilter: "blur(18px)",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: "24px",
        maxWidth: "900px",
        width: "100%",
        maxHeight: "90vh",
        overflowY: "auto",
        padding: "30px",
        boxShadow: "0 0 40px rgba(0,0,0,0.45)"
      }}
    >
      <button
        onClick={() => setSelectedProduct(null)}
        style={{
          background: "#d10000",
          color: "white",
          border: "none",
          padding: "10px 14px",
          borderRadius: "8px",
          cursor: "pointer",
          float: "right",
          marginBottom: "20px"
        }}
      >
        Close
      </button>

      {selectedProduct.image && (
        <img
          src={selectedProduct.image}
          style={{
            width: "100%",
            maxHeight: "420px",
            objectFit: "cover",
            borderRadius: "18px",
            marginBottom: "25px"
          }}
        />
      )}

      <h1
        style={{
          fontSize: "42px",
          marginBottom: "10px"
        }}
      >
        {selectedProduct.name}
      </h1>

      <p
        style={{
          color: "#b0b0b0",
          marginBottom: "30px"
        }}
      >
        {selectedProduct.category}
      </p>
{selectedProduct.description && (
  <div
    style={{
      marginBottom: "30px",
      lineHeight: "1.7",
      color: "#d0d0d0",
      fontSize: "16px"
    }}
  >
    {selectedProduct.description}
  </div>
)}
      <div
        style={{
          display: "grid",
          gap: "15px"
        }}
      >
        {selectedProduct.sizes_json?.map((s, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              background: "rgba(255,255,255,0.04)",
              padding: "14px",
              borderRadius: "12px"
            }}
          >
            <div>
              <strong>{s.size}</strong>
              <div>${s.price}</div>
            </div>

            <button
              onClick={() =>
                addToCart(selectedProduct.name, s)
              }
              style={{
                background: "#d10000",
                color: "white",
                border: "none",
                padding: "10px 16px",
                borderRadius: "8px",
                cursor: "pointer"
              }}
            >
              Add to Cart
            </button>
          </div>
        ))}
      </div>
    </div>
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
      onMouseEnter={(e) => {
  e.currentTarget.style.transform =
    "translateY(-2px) scale(1.02)";
}}

onMouseLeave={(e) => {
  e.currentTarget.style.transform =
    "translateY(0px) scale(1)";
}}
      style={{
        transition:
  "transform 0.2s ease, box-shadow 0.2s ease",
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
  onMouseEnter={(e) => {
  e.currentTarget.style.transform =
    "translateY(-2px) scale(1.02)";
}}

onMouseLeave={(e) => {
  e.currentTarget.style.transform =
    "translateY(0px) scale(1)";
}}
  style={{
    transition:
  "transform 0.2s ease, box-shadow 0.2s ease",
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
<textarea
  placeholder="Product Description"
  value={newDescription}
  onChange={(e) =>
    setNewDescription(e.target.value)
  }
  style={{
    ...inputStyle,
    minHeight: "120px",
    resize: "vertical"
  }}
/>
          <label
    onMouseEnter={(e) => {
  e.currentTarget.style.transform =
    "translateY(-2px) scale(1.02)";
}}

onMouseLeave={(e) => {
  e.currentTarget.style.transform =
    "translateY(0px) scale(1)";
}}
  style={{
    transition:
  "transform 0.2s ease, box-shadow 0.2s ease",
    display: "inline-block",
    background: "#1e3a5f",
    color: "white",
    padding: "12px 18px",
    borderRadius: "10px",
    cursor: "pointer",
    fontWeight: "bold",
    marginTop: "10px",
    marginBottom: "15px"
  }}
>
  Choose Product Image

  <input
    type="file"
    accept="image/*"
    onChange={(e) =>
      setFile(e.target.files?.[0] || null)
    }
    style={{ display: "none" }}
  />
</label>

          <button
  onClick={addProduct}
  onMouseEnter={(e) => {
  e.currentTarget.style.transform =
    "translateY(-2px) scale(1.02)";

  e.currentTarget.style.boxShadow =
    "0 0 18px rgba(209,0,0,0.35)";
}}

onMouseLeave={(e) => {
  e.currentTarget.style.transform =
    "translateY(0px) scale(1)";

  e.currentTarget.style.boxShadow =
    "0 0 14px rgba(209,0,0,0.28)";
}}
  style={{
    transition:
  "transform 0.2s ease, box-shadow 0.2s ease",
    background: "#d10000",
    color: "white",
    border: "none",
    padding: "12px 18px",
    borderRadius: "10px",
    cursor: "pointer",
    fontWeight: "bold",
    boxShadow: "0 0 14px rgba(209,0,0,0.28)",
  }}
>
  {editingId ? "Save Changes" : "Add Product"}
</button>
{editingId && (
  <button
    onClick={() => {
      setEditingId(null);
      setNewName("");
      setNewSizes([
        { size: "", price: 0 }
      ]);
      setNewCategory("Parts");
      setNewImage("");
    }}
    onMouseEnter={(e) => {
  e.currentTarget.style.transform =
    "translateY(-2px) scale(1.02)";
}}

onMouseLeave={(e) => {
  e.currentTarget.style.transform =
    "translateY(0px) scale(1)";
}}
    style={{
      transition:
  "transform 0.2s ease, box-shadow 0.2s ease",
      marginLeft: "10px",
      background: "#444",
      color: "white",
      border: "none",
      padding: "10px 14px",
      borderRadius: "6px",
      cursor: "pointer"
    }}
  >
    Cancel Edit
  </button>
)}
        </div>
      )}

    </div>
  );
}