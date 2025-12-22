// ======================================================
// CONFIG GLOBAL
// ======================================================
const API_URL = "http://localhost:4000/api";

// Función base para todas las peticiones
async function apiRequest(endpoint, method = "GET", data = null, auth = false) {
    const options = {
        method,
        headers: {
            "Content-Type": "application/json"
        }
    };

    if (auth) {
        const token = localStorage.getItem("token");
        if (token) options.headers["Authorization"] = `Bearer ${token}`;
    }

    if (data) options.body = JSON.stringify(data);

    try {
        const res = await fetch(API_URL + endpoint, options);
        const json = await res.json();
        return json;
    } catch (error) {
        console.error("❌ Error API:", error);
        return { ok: false, error: "Error al conectar con el servidor." };
    }
}

// ======================================================
// REGISTRO
// ======================================================
async function registerUser(name, email, password) {
    return apiRequest("/users/register", "POST", { name, email, password });
}

async function onRegister() {
    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();

    if (!name || !email || !password)
        return alert("Completa todos los campos.");

    const res = await registerUser(name, email, password);

    if (res.ok) {
        alert("Cuenta creada correctamente ✨");
        closeModal("#modalRegistro");
    } else {
        alert(res.error || "No se pudo registrar.");
    }
}

// ======================================================
// LOGIN
// ======================================================
async function loginUser(email, password) {
    return apiRequest("/users/login", "POST", { email, password });
}

async function onLogin() {
    const email = document.getElementById("emailLogin").value.trim();
    const password = document.getElementById("passwordLogin").value.trim();

    if (!email || !password)
        return alert("Completa todos los campos.");

    const res = await loginUser(email, password);

    if (res.ok) {
        localStorage.setItem("userId", res.user.id);
        localStorage.setItem("token", res.token);

        alert("Bienvenido 👁✨");
        closeModal("#modalLogin");
    } else {
        alert(res.error || "Credenciales incorrectas.");
    }
}

// ======================================================
// LIBROS
// ======================================================
async function getBooks() {
    return apiRequest("/books", "GET");
}

async function getBook(id) {
    return apiRequest(`/books/${id}`, "GET");
}

// ======================================================
// ORDEN
// ======================================================
async function createOrder(userId, bookId, quantity = 1) {
    return apiRequest("/orders", "POST", {
        user_id: userId,
        items: [{ book_id: bookId, quantity }]
    }, true);
}

// ======================================================
// PAGO
// ======================================================
async function registerPayment(orderId, method, amount) {
    return apiRequest("/payments", "POST", {
        order_id: orderId,
        method,
        amount
    }, true);
}

// ======================================================
// COMPRA COMPLETA
// ======================================================
async function onBuy(bookId, price) {
    const userId = localStorage.getItem("userId");

    if (!userId) {
        alert("Debes iniciar sesión para comprar.");
        return;
    }

    // 1️⃣ Crear orden
    const order = await createOrder(userId, bookId, 1);

    if (!order.ok) {
        console.error(order);
        return alert("No se pudo crear la orden.");
    }

    // 2️⃣ Registrar pago
    const pay = await registerPayment(order.order_id, "transferencia", price);

    if (pay.ok) {
        alert("Gracias por tu compra ✨📘");
        closeModal("#modalCompra");
    } else {
        alert(pay.error || "Error procesando el pago.");
    }
}

// ======================================================
// CONTACTO (GUARDADO EN BD)
// ======================================================
document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("formContacto");
    const result = document.getElementById("resultado");

    if (!form) return;

    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        const data = {
            nombre: form.nombre.value.trim(),
            correo: form.correo.value.trim(),
            mensaje: form.mensaje.value.trim()
        };

        if (!data.nombre || !data.correo || !data.mensaje) {
            result.textContent = "Completa todos los campos.";
            result.style.color = "red";
            return;
        }

        const res = await apiRequest("/contact", "POST", data);

        if (res.ok) {
            result.textContent = "Mensaje enviado correctamente ✨";
            result.style.color = "lightgreen";
            form.reset();
        } else {
            result.textContent = res.error || "Error al enviar mensaje.";
            result.style.color = "red";
        }
    });
});

// ======================================================
// UTILIDAD: CERRAR MODALES
// ======================================================
function closeModal(selector) {
    const modalEl = document.querySelector(selector);
    const modal = bootstrap.Modal.getInstance(modalEl);
    if (modal) modal.hide();
}
