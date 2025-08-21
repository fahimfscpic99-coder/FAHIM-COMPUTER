/* Shop Manager – PWA (Bangla) */
const { useState, useEffect, useMemo } = React;

const ls = {
  get(key, fallback){
    try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; }
    catch { return fallback; }
  },
  set(key, val){ localStorage.setItem(key, JSON.stringify(val)); }
};

const currency = (n) => new Intl.NumberFormat("bn-BD", {style:"currency", currency:"BDT", maximumFractionDigits:0}).format(Number(n||0));
const uid = () => Math.random().toString(36).slice(2,10);

function App(){
  const [tab, setTab] = useState("dashboard");
  const [products, setProducts] = useState(()=> ls.get("sm_products", demoProducts()));
  const [sales, setSales] = useState(()=> ls.get("sm_sales", []));
  const [purchases, setPurchases] = useState(()=> ls.get("sm_purchases", []));

  useEffect(()=> ls.set("sm_products", products), [products]);
  useEffect(()=> ls.set("sm_sales", sales), [sales]);
  useEffect(()=> ls.set("sm_purchases", purchases), [purchases]);

  const stats = useMemo(()=>{
    const today = new Date().toISOString().slice(0,10);
    const totalSales = sales.reduce((s,r)=> s + r.total, 0);
    const todaySales = sales.filter(r=> r.date===today).reduce((s,r)=> s + r.total, 0);
    const lowStock = products.filter(p=> p.stock <= p.reorderLevel);
    return { totalSales, todaySales, lowStockCount: lowStock.length };
  }, [sales, products]);

  return React.createElement("div", {className:"min-h-screen text-gray-900"},
    React.createElement("header", {className:"bg-indigo-600 text-white px-4 py-3 shadow sticky top-0"},
      React.createElement("div", {className:"max-w-6xl mx-auto flex items-center justify-between"},
        React.createElement("h1", {className:"text-xl md:text-2xl font-bold"}, "দোকান ম্যানেজার – ইনভেন্টরি & বিক্রয়"),
        React.createElement("nav", {className:"flex gap-2 text-sm"},
          React.createElement(TabBtn, {id:"dashboard", tab, setTab}, "ড্যাশবোর্ড"),
          React.createElement(TabBtn, {id:"products", tab, setTab}, "পণ্য"),
          React.createElement(TabBtn, {id:"sales", tab, setTab}, "বিক্রয়"),
          React.createElement(TabBtn, {id:"purchase", tab, setTab}, "ক্রয়"),
          React.createElement(TabBtn, {id:"reports", tab, setTab}, "রিপোর্ট/এক্সপোর্ট")
        )
      )
    ),
    React.createElement("main", {className:"max-w-6xl mx-auto p-4"},
      tab==="dashboard" && React.createElement(Dashboard, {stats, products, setTab}),
      tab==="products" && React.createElement(Products, {products, setProducts}),
      tab==="sales" && React.createElement(Sales, {products, setProducts, sales, setSales}),
      tab==="purchase" && React.createElement(Purchase, {products, setProducts, purchases, setPurchases}),
      tab==="reports" && React.createElement(Reports, {products, sales, purchases})
    )
  );
}

function TabBtn({id, tab, setTab, children}){
  const active = tab===id;
  return React.createElement("button", {
    onClick: ()=> setTab(id),
    className: "px-3 py-1 rounded-2xl text-xs md:text-sm font-semibold transition shadow " + (active ? "bg-white text-indigo-700" : "bg-indigo-500 hover:bg-indigo-400 text-white")
  }, children);
}

function Dashboard({stats, products, setTab}){
  const toBuy = products.filter(p=> p.stock <= p.reorderLevel);
  return React.createElement("div", {className:"grid md:grid-cols-3 gap-4"},
    React.createElement(StatCard, {title:"আজকের বিক্রয়", value:currency(stats.todaySales)}),
    React.createElement(StatCard, {title:"মোট বিক্রয়", value:currency(stats.totalSales)}),
    React.createElement(StatCard, {title:"রিঅর্ডার দরকার", value:`${stats.lowStockCount} টি পণ্য`}),
    React.createElement("div", {className:"md:col-span-3 bg-white rounded-2xl p-4 shadow"},
      React.createElement("div", {className:"flex items-center justify-between mb-2"},
        React.createElement("h3", {className:"text-lg font-bold"}, "কী কী কিনতে হবে (রিঅর্ডার তালিকা)"),
        React.createElement("button", {className:"px-3 py-1 bg-indigo-600 text-white rounded-lg", onClick:()=> setTab("purchase")}, "ক্রয় ট্যাবে যান")
      ),
      toBuy.length===0 ? React.createElement("p", {className:"text-gray-600"}, "সব পণ্যের স্টক ঠিক আছে।")
      : React.createElement("table", {className:"w-full text-left text-sm"},
          React.createElement("thead", null,
            React.createElement("tr", {className:"text-gray-500"},
              React.createElement("th", {className:"py-2"}, "পণ্য"),
              React.createElement("th", null, "স্টক"),
              React.createElement("th", null, "রিঅর্ডার লেভেল"),
              React.createElement("th", null, "প্রস্তাবিত ক্রয় পরিমাণ")
            )
          ),
          React.createElement("tbody", null,
            toBuy.map(p=> React.createElement("tr", {key:p.id, className:"border-t"},
              React.createElement("td", {className:"py-2 font-medium"}, p.name),
              React.createElement("td", null, p.stock),
              React.createElement("td", null, p.reorderLevel),
              React.createElement("td", null, Math.max(p.reorderLevel*2 - p.stock, 1))
            ))
          )
        )
    )
  );
}

function StatCard({title, value}){
  return React.createElement("div", {className:"bg-white rounded-2xl p-4 shadow"},
    React.createElement("p", {className:"text-gray-600 text-sm"}, title),
    React.createElement("p", {className:"text-2xl font-extrabold mt-1"}, value)
  );
}

function Products({products, setProducts}){
  const [q, setQ] = useState("");
  const filtered = useMemo(()=> products.filter(p => [p.name, p.sku].join(" ").toLowerCase().includes(q.toLowerCase())), [products, q]);
  const [form, setForm] = useState({ name:\"\", sku:\"\", stock:0, costPrice:0, sellPrice:0, reorderLevel:5 });

  const addProduct = () => {
    if (!form.name) return alert(\"পণ্যের নাম দিন\");
    setProducts(prev => [{ id: uid(), ...form, stock:Number(form.stock||0), costPrice:Number(form.costPrice||0), sellPrice:Number(form.sellPrice||0), reorderLevel:Number(form.reorderLevel||0) }, ...prev]);
    setForm({ name:\"\", sku:\"\", stock:0, costPrice:0, sellPrice:0, reorderLevel:5 });
  };

  const remove = (id) => setProducts(prev => prev.filter(p=> p.id!==id));

  const updateField = (id, field, value) => {
    setProducts(prev => prev.map(p => p.id===id ? ({ ...p, [field]: (field==='name'||field==='sku') ? value : Number(value) }) : p));
  };

  return React.createElement("div", {className:"grid gap-4"},
    React.createElement("div", {className:"bg-white rounded-2xl p-4 shadow"},
      React.createElement("h3", {className:"font-bold mb-3"}, "নতুন পণ্য যোগ করুন"),
      React.createElement("div", {className:"grid md:grid-cols-6 gap-2"},
        React.createElement(Input, {label:\"নাম\", value:form.name, onChange:e=>setForm({...form, name:e.target.value})}),
        React.createElement(Input, {label:\"SKU/কোড\", value:form.sku, onChange:e=>setForm({...form, sku:e.target.value})}),
        React.createElement(Input, {type:\"number\", label:\"স্টক\", value:form.stock, onChange:e=>setForm({...form, stock:e.target.value})}),
        React.createElement(Input, {type:\"number\", label:\"ক্রয়মূল্য\", value:form.costPrice, onChange:e=>setForm({...form, costPrice:e.target.value})}),
        React.createElement(Input, {type:\"number\", label:\"বিক্রয়মূল্য\", value:form.sellPrice, onChange:e=>setForm({...form, sellPrice:e.target.value})}),
        React.createElement(Input, {type:\"number\", label:\"রিঅর্ডার লেভেল\", value:form.reorderLevel, onChange:e=>setForm({...form, reorderLevel:e.target.value})})
      ),
      React.createElement("div", {className:"mt-3 flex gap-2"},
        React.createElement("button", {onClick:addProduct, className:"px-4 py-2 bg-indigo-600 text-white rounded-lg"}, "পণ্য যোগ"),
        React.createElement("button", {onClick:()=>{setProducts(demoProducts());}, className:"px-4 py-2 bg-gray-200 rounded-lg"}, "ডেমো ডাটা")
      )
    ),
    React.createElement("div", {className:"bg-white rounded-2xl p-4 shadow"},
      React.createElement("div", {className:"flex items-center justify-between mb-2"},
        React.createElement("h3", {className:"font-bold"}, "পণ্য তালিকা"),
        React.createElement("input", {value:q, onChange:e=>setQ(e.target.value), placeholder:"সার্চ...", className:"px-3 py-2 border rounded-lg"})
      ),
      React.createElement("div", {className:"overflow-auto"},
        React.createElement("table", {className:"w-full text-left text-sm min-w-[700px]"},
          React.createElement("thead", null,
            React.createElement("tr", {className:"text-gray-500"},
              React.createElement("th", {className:"py-2"}, "নাম"),
              React.createElement("th", null, "SKU"),
              React.createElement("th", null, "স্টক"),
              React.createElement("th", null, "ক্রয়মূল্য"),
              React.createElement("th", null, "বিক্রয়মূল্য"),
              React.createElement("th", null, "রিঅর্ডার"),
              React.createElement("th", null, "")
            )
          ),
          React.createElement("tbody", null,
            filtered.map(p=> React.createElement("tr", {key:p.id, className:"border-t"},
              React.createElement("td", {className:"py-2"}, React.createElement("input", {className:"w-full bg-transparent", value:p.name, onChange:e=>updateField(p.id, 'name', e.target.value)})),
              React.createElement("td", null, React.createElement("input", {className:"w-full bg-transparent", value:p.sku, onChange:e=>updateField(p.id, 'sku', e.target.value)})),
              React.createElement("td", null, React.createElement("input", {type:"number", className:"w-20 bg-transparent", value:p.stock, onChange:e=>updateField(p.id, 'stock', e.target.value)})),
              React.createElement("td", null, React.createElement("input", {type:"number", className:"w-24 bg-transparent", value:p.costPrice, onChange:e=>updateField(p.id, 'costPrice', e.target.value)})),
              React.createElement("td", null, React.createElement("input", {type:"number", className:"w-24 bg-transparent", value:p.sellPrice, onChange:e=>updateField(p.id, 'sellPrice', e.target.value)})),
              React.createElement("td", null, React.createElement("input", {type:"number", className:"w-20 bg-transparent", value:p.reorderLevel, onChange:e=>updateField(p.id, 'reorderLevel', e.target.value)})),
              React.createElement("td", {className:"text-right"}, React.createElement("button", {onClick:()=>remove(p.id), className:"text-red-600"}, "মুছুন"))
            ))
          )
        )
      )
    )
  );
}

function Input({label, ...rest}){
  return React.createElement("label", {className:"text-sm grid gap-1"},
    React.createElement("span", {className:"text-gray-600"}, label),
    React.createElement("input", Object.assign({}, rest, {className: (rest.className||"") + " px-3 py-2 border rounded-lg"}))
  );
}

function Sales({products, setProducts, sales, setSales}){
  const [pid, setPid] = useState(products[0]?.id || "");
  const [qty, setQty] = useState(1);
  useEffect(()=>{ if(!products.find(p=>p.id===pid) && products[0]) setPid(products[0].id); }, [products]);

  const addSale = () => {
    const p = products.find(x=> x.id===pid);
    if(!p) return alert("পণ্য সিলেক্ট করুন");
    if(qty<=0) return alert("পরিমাণ দিন");
    if(p.stock < qty) return alert("স্টক যথেষ্ট নেই");
    const total = qty * p.sellPrice;
    const record = { id: uid(), productId:p.id, name:p.name, qty:Number(qty), rate:p.sellPrice, total, date: new Date().toISOString().slice(0,10) };
    setSales(prev => [record, ...prev]);
    setProducts(prev => prev.map(x => x.id===p.id ? {...x, stock: x.stock - qty} : x));
    setQty(1);
  };

  const today = new Date().toISOString().slice(0,10);
  const sumToday = sales.filter(s=> s.date===today).reduce((s,r)=> s + r.total, 0);

  return React.createElement("div", {className:"grid gap-4"},
    React.createElement("div", {className:"bg-white rounded-2xl p-4 shadow grid md:grid-cols-4 gap-3 items-end"},
      React.createElement("label", {className:"grid gap-1"},
        React.createElement("span", {className:"text-sm text-gray-600"}, "পণ্য"),
        React.createElement("select", {className:"px-3 py-2 border rounded-lg", value:pid, onChange:e=>setPid(e.target.value)},
          products.map(p=> React.createElement("option", {key:p.id, value:p.id}, `${p.name} — স্টক: ${p.stock}`))
        )
      ),
      React.createElement(Input, {type:"number", label:"পরিমাণ", value:qty, onChange:e=>setQty(Number(e.target.value))}),
      React.createElement("button", {onClick:addSale, className:"px-4 py-2 bg-green-600 text-white rounded-lg"}, "বিক্রয় যুক্ত করুন"),
      React.createElement("div", null,
        React.createElement("p", {className:"text-sm text-gray-600"}, "আজকের বিক্রয়"),
        React.createElement("p", {className:"text-xl font-bold"}, currency(sumToday))
      )
    ),
    React.createElement("div", {className:"bg-white rounded-2xl p-4 shadow"},
      React.createElement("h3", {className:"font-bold mb-2"}, "বিক্রয় তালিকা"),
      React.createElement("div", {className:"overflow-auto"},
        React.createElement("table", {className:"w-full text-left text-sm min-w-[650px]"},
          React.createElement("thead", {className:"text-gray-500"},
            React.createElement("tr", null,
              React.createElement("th", {className:"py-2"}, "তারিখ"),
              React.createElement("th", null, "পণ্য"),
              React.createElement("th", null, "পরিমাণ"),
              React.createElement("th", null, "দর"),
              React.createElement("th", null, "মোট")
            )
          ),
          React.createElement("tbody", null,
            sales.map(s=> React.createElement("tr", {key:s.id, className:"border-t"},
              React.createElement("td", {className:"py-2"}, s.date),
              React.createElement("td", null, s.name),
              React.createElement("td", null, s.qty),
              React.createElement("td", null, currency(s.rate)),
              React.createElement("td", {className:"font-semibold"}, currency(s.total))
            ))
          )
        )
      )
    )
  );
}

function Purchase({products, setProducts, purchases, setPurchases}){
  const [pid, setPid] = useState(products[0]?.id || "");
  const [qty, setQty] = useState(10);
  const [rate, setRate] = useState(products.find(p=>p.id===pid)?.costPrice || 0);
  useEffect(()=>{ setRate(products.find(p=>p.id===pid)?.costPrice || 0); }, [pid, products]);

  const addPurchase = () => {
    const p = products.find(x=> x.id===pid);
    if(!p) return alert("পণ্য সিলেক্ট করুন");
    if(qty<=0) return alert("পরিমাণ দিন");
    const total = qty * rate;
    const record = { id: uid(), productId:p.id, name:p.name, qty:Number(qty), rate:Number(rate), total, date: new Date().toISOString().slice(0,10) };
    setPurchases(prev => [record, ...prev]);
    setProducts(prev => prev.map(x => x.id===p.id ? {...x, stock: x.stock + Number(qty), costPrice: rate} : x));
    setQty(10);
  };

  const toBuy = products.filter(p=> p.stock <= p.reorderLevel);

  return React.createElement("div", {className:"grid gap-4"},
    React.createElement("div", {className:"bg-white rounded-2xl p-4 shadow grid md:grid-cols-4 gap-3 items-end"},
      React.createElement("label", {className:"grid gap-1"},
        React.createElement("span", {className:"text-sm text-gray-600"}, "পণ্য"),
        React.createElement("select", {className:"px-3 py-2 border rounded-lg", value:pid, onChange:e=>setPid(e.target.value)},
          products.map(p=> React.createElement("option", {key:p.id, value:p.id}, `${p.name} — স্টক: ${p.stock}`))
        )
      ),
      React.createElement(Input, {type:"number", label:"পরিমাণ", value:qty, onChange:e=>setQty(Number(e.target.value))}),
      React.createElement(Input, {type:"number", label:"ক্রয় দর", value:rate, onChange:e=>setRate(Number(e.target.value))}),
      React.createElement("button", {onClick:addPurchase, className:"px-4 py-2 bg-indigo-600 text-white rounded-lg"}, "ক্রয় যুক্ত করুন")
    ),
    React.createElement("div", {className:"bg-white rounded-2xl p-4 shadow"},
      React.createElement("div", {className:"flex items-center justify-between mb-2"},
        React.createElement("h3", {className:"font-bold"}, "রিঅর্ডার তালিকা")
      ),
      toBuy.length===0 ? React.createElement("p", {className:"text-gray-600"}, "এখনই কিছু কেনার দরকার নেই।")
      : React.createElement("div", {className:"overflow-auto"},
          React.createElement("table", {className:"w-full text-left text-sm min-w-[650px]"},
            React.createElement("thead", {className:"text-gray-500"},
              React.createElement("tr", null,
                React.createElement("th", {className:"py-2"}, "পণ্য"),
                React.createElement("th", null, "স্টক"),
                React.createElement("th", null, "রিঅর্ডার"),
                React.createElement("th", null, "প্রস্তাবিত ক্রয়")
              )
            ),
            React.createElement("tbody", null,
              toBuy.map(p=> React.createElement("tr", {key:p.id, className:"border-t"},
                React.createElement("td", {className:"py-2"}, p.name),
                React.createElement("td", null, p.stock),
                React.createElement("td", null, p.reorderLevel),
                React.createElement("td", null, Math.max(p.reorderLevel*2 - p.stock, 1))
              ))
            )
          )
        )
    ),
    React.createElement("div", {className:"bg-white rounded-2xl p-4 shadow"},
      React.createElement("h3", {className:"font-bold mb-2"}, "ক্রয় হিসাব"),
      React.createElement("div", {className:"overflow-auto"},
        React.createElement("table", {className:"w-full text-left text-sm min-w-[650px]"},
          React.createElement("thead", {className:"text-gray-500"},
            React.createElement("tr", null,
              React.createElement("th", {className:"py-2"}, "তারিখ"),
              React.createElement("th", null, "পণ্য"),
              React.createElement("th", null, "পরিমাণ"),
              React.createElement("th", null, "দর"),
              React.createElement("th", null, "মোট")
            )
          ),
          React.createElement("tbody", null,
            purchases.map(s=> React.createElement("tr", {key:s.id, className:"border-t"},
              React.createElement("td", {className:"py-2"}, s.date),
              React.createElement("td", null, s.name),
              React.createElement("td", null, s.qty),
              React.createElement("td", null, currency(s.rate)),
              React.createElement("td", {className:"font-semibold"}, currency(s.total))
            ))
          )
        )
      )
    )
  );
}

function Reports({products, sales, purchases}){
  const exportCSV = (rows, filename) => {
    if(!rows.length){ alert("ডাটা নেই"); return; }
    const headers = Object.keys(rows[0]);
    const csv = [headers.join(",")].concat(rows.map(r => headers.map(h => JSON.stringify(r[h] ?? \"\")).join(","))).join("\\n");
    const blob = new Blob([csv], {type:\"text/csv;charset=utf-8;\"});
    const url = URL.createObjectURL(blob);
    const a = document.createElement(\"a\"); a.href=url; a.download=filename; a.click(); URL.revokeObjectURL(url);
  };
  const exportJSON = (obj, filename) => {
    const blob = new Blob([JSON.stringify(obj, null, 2)], {type:\"application/json\"});
    const url = URL.createObjectURL(blob);
    const a = document.createElement(\"a\"); a.href=url; a.download=filename; a.click(); URL.revokeObjectURL(url);
  };

  const totalStockValue = products.reduce((s,p)=> s + p.stock * p.costPrice, 0);
  const potentialRevenue = products.reduce((s,p)=> s + p.stock * p.sellPrice, 0);

  return React.createElement("div", {className:"grid md:grid-cols-2 gap-4"},
    React.createElement("div", {className:"bg-white rounded-2xl p-4 shadow"},
      React.createElement("h3", {className:"font-bold mb-2"}, "স্টক ভ্যালু"),
      React.createElement("p", null, "বর্তমান স্টকের ক্রয়মূল্য: ", React.createElement("strong", null, currency(totalStockValue))),
      React.createElement("p", null, "সব বিক্রি হলে সম্ভাব্য বিক্রয়: ", React.createElement("strong", null, currency(potentialRevenue)))
    ),
    React.createElement("div", {className:"bg-white rounded-2xl p-4 shadow"},
      React.createElement("h3", {className:"font-bold mb-2"}, "ডাটা এক্সপোর্ট"),
      React.createElement("div", {className:"flex flex-wrap gap-2"},
        React.createElement("button", {className:"px-3 py-2 bg-gray-200 rounded-lg", onClick:()=>exportCSV(products, "products.csv")}, "Products CSV"),
        React.createElement("button", {className:"px-3 py-2 bg-gray-200 rounded-lg", onClick:()=>exportCSV(sales, "sales.csv")}, "Sales CSV"),
        React.createElement("button", {className:"px-3 py-2 bg-gray-200 rounded-lg", onClick:()=>exportCSV(purchases, "purchases.csv")}, "Purchases CSV"),
        React.createElement("button", {className:"px-3 py-2 bg-indigo-600 text-white rounded-lg", onClick:()=>exportJSON({products, sales, purchases}, "backup.json")}, "Full Backup (JSON)")
      )
    )
  );
}

function demoProducts(){
  return [
    { id: uid(), name: "কলম (ম্যাটাডোর পিনপয়েন্ট)", sku: "PEN-MAT-PIN", stock: 48, costPrice: 10, sellPrice: 12, reorderLevel: 20 },
    { id: uid(), name: "A4 ফটোকপি পেপার (রিম)", sku: "PAPER-A4-RIM", stock: 6, costPrice: 420, sellPrice: 500, reorderLevel: 8 },
    { id: uid(), name: "স্ট্যাপলার #10", sku: "STAP-10", stock: 12, costPrice: 70, sellPrice: 90, reorderLevel: 10 },
    { id: uid(), name: "ইঙ্ক (Epson 003)", sku: "INK-003", stock: 3, costPrice: 320, sellPrice: 380, reorderLevel: 5 },
  ];
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(React.createElement(App));
