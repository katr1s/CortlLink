// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import {
  collection,
  deleteDoc,
  getDocs,
  getFirestore,
  increment,
  onSnapshot,
  updateDoc,
} from "firebase/firestore";
import { doc, getDoc } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.PUBLIC_API_KEY,
  authDomain: import.meta.env.PUBLIC_AUTH_DOMAIN,
  projectId: import.meta.env.PUBLIC_PROJECT_ID,
  storageBucket: import.meta.env.PUBLIC_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.PUBLIC_MESSAGING_SENDER_ID,
  appId: import.meta.env.PUBLIC_APP_ID,
  measurementId: import.meta.env.PUBLIC_MEASUREMENT_ID,
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);

// Analytics (⚠️ solo funciona en navegador, no en SSR/Node)
let analytics;
if (typeof window !== "undefined") {
  analytics = getAnalytics(app);
}

export const auth = getAuth(app);
export const db = getFirestore(app);
const provider = new GoogleAuthProvider();

// Función para login con Google
export const Google = async () => {
  try {
    const result = await signInWithPopup(auth, provider);
    const user = result.user;
    console.log("Usuario logueado:", user);

    // Referencia al documento del usuario
    const userRef = doc(db, "users", user.uid);
    const userDoc = await getDoc(userRef);

    if (userDoc.exists()) {
      // Usuario ya registrado → lo mando al dashboard
      window.location.href = "/Folders";
    } else {
      // Usuario nuevo → lo mando a la página de creación de perfil
      window.location.href = "/create-user";
    }
  } catch (error) {
    console.error("Error al iniciar sesión:", error);
  }
};

async function urlDelete(username, Alias) {
  const apiUrl = import.meta.env.PUBLIC_API_DELETE;

  try {
    const response = await fetch(`${apiUrl}/${username}/${Alias}`, {
      method: "DELETE",
    });

    if (response.ok) {
      alert("URL eliminada con éxito ✅");
    } else {
      alert("❌ Error al eliminar la URL");
      return
    }
  } catch (error) {
    console.error("Error en la petición:", error);
    alert("⚠️ Ocurrió un error al conectar con el servidor");
  }
}


export const unsubcribe = (id, folder, container) => {
  const DocRef = collection(db, "users", id, folder);
  const Snap = onSnapshot(DocRef, (snapshot) => {
    container.innerHTML = "";
    snapshot.forEach((snap) => {
      const array = snap.data();
      const div = document.createElement("div");
      div.classList.add("card");

      div.innerHTML = `
          <div class="up">
            <div class="title">
              <img src="/Aplications/${array.platform}" alt"${array.platformName} />
              <h4>${array.platformName}</h4>
            </div>
            <button class="copyBtn"data-link="${array.url}"><img src="/icons/copy.svg" alt="copy" /></button>
          </div>

          <div class="inf">
            <h3>${array.Name}</h3>
            <p>${array.Description}</p>
          </div>

          <div class="buttons">
            <button class="deleteBtn"><img src="/icons/delete.svg" alt="copy" /></button>
            <a href="${array.url}" target="_blank">view</a>
          </div>
      `;

      container.appendChild(div);

      document.querySelectorAll(".deleteBtn").forEach((btn) =>{
        btn.addEventListener("click", async ()=>{
          const RefDocumentDelete = doc(db, "users", `${array.userId}`,`${array.Folder}` ,`${array.Alias}`);

          try{
            console.log(`users/ ${array.userId}/${array.Folder} /${array.Alias}`)
            urlDelete(array.username, array.Alias);
            await deleteDoc(RefDocumentDelete);
          }catch(error){
            console.log(error)
          }

          
        })
      })

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
    });
  });

  return Snap;
};

export const deleteFolder = async (id, username, Alias) => {
  const colRef = collection(db, "users", id, Alias);
  const apiUrl = import.meta.env.PUBLIC_API_DELETE;

  try {
    const snapshot = await getDocs(colRef);
    const Folder = doc(db, "users", id, "FolderInf", Alias)
    const docRef = doc(db, "users", id);

    await updateDoc(docRef, {
      CreateCollections: increment(-1),
    });


    snapshot.forEach( async (snap) => {
      const data = snap.data();

      urlDelete(username, `${data.Alias}`)

      const DocFolder = doc(db, "users", id, data.Folder, data.Alias)
      await deleteDoc(DocFolder)

    })

  
    await deleteDoc(Folder)
    window.location.href = `/Folders`;

  } catch (error) {
    console.error("Error eliminando carpeta:", error);
  }
};

export async function DeleteCardFolder(){
  console.log("hello")
}

