// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { collection, getFirestore, onSnapshot } from "firebase/firestore";
import { doc, getDoc } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.PUBLIC_API_KEY,
  authDomain: import.meta.env.PUBLIC_AUTH_DOMAIN,
  projectId: import.meta.env.PUBLIC_PROJECT_ID,
  storageBucket: import.meta.env.PUBLIC_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.PUBLIC_MESSAGING_SENDER_ID,
  appId: import.meta.env.PUBLIC_APP_ID,
  measurementId: import.meta.env.PUBLIC_MEASUREMENT_ID
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);

// Analytics (⚠️ solo funciona en navegador, no en SSR/Node)
let analytics;
if (typeof window !== "undefined") {
  analytics = getAnalytics(app);
}

export const auth = getAuth(app);
export const db = getFirestore(app)
const provider = new GoogleAuthProvider();

// Función para login con Google
export const Google = async () => {
  try {
    console.log("Prueba")
    const result = await signInWithPopup(auth, provider);
    const user = result.user;
    console.log("Usuario logueado:", user);

    // Referencia al documento del usuario
    const userRef = doc(db, "users", user.uid);
    const userDoc = await getDoc(userRef);

    if (userDoc.exists()) {
      // Usuario ya registrado → lo mando al dashboard
      window.location.href = "/Dashboard";
    } else {
      // Usuario nuevo → lo mando a la página de creación de perfil
      window.location.href = "/create-user";
    }

    
  } catch (error) {
    console.error("Error al iniciar sesión:", error);
  }
};

export const unsubcribe = (id, folder, container) => {
  const DocRef = collection(db, "users", id, folder )
  const Snap = onSnapshot(DocRef, (snapshot) => {
    container.innerHTML = "";
    snapshot.forEach((doc) => {
      const array = doc.data()      
      const div = document.createElement("div")
      div.classList.add("card")

      div.innerHTML = `
        <h3>${array.Name}</h3>
        <p>${array.Description}</p>
        <div class="buttons">
          <a
            href="${array.url}"
            target="_blank">/${array.username}/${array.Alias}</a
          >
          <button
            class="copyBtn"
            data-link="${array.url}"
          >
            Copy</button
          >
      `

      container.appendChild(div);

      document.querySelectorAll(".copyBtn").forEach((btn) => {
      btn.addEventListener("click", async () => {
        const link = btn.dataset.link; // obtiene el enlace del atributo data-link
        try {
          await navigator.clipboard.writeText(link);
          alert(`Enlace copiado ✅\n${link}`);
        } catch (err) {
          console.error("Error al copiar: ", err);
        }
      });
    });
    })
  })

  return Snap
}
