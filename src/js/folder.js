import { auth, db, deleteFolder } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  increment,
  setDoc,
  updateDoc,
} from "firebase/firestore";

const openForm = document.querySelector(".card");
const sectionForm = document.querySelector(".new");
const form = document.querySelector(".createFolder");
const selectIcon = document.querySelector(".Icons");
const Icon = document.querySelector(".Icon-Folder");
const NumberFolders = document.querySelector(".user-collection");
const box = document.querySelector(".box");

const backCollection = document
  .querySelector(".refresh")
  ?.addEventListener("click", () => {
    window.location.href = `/Folders`;
  });

// Renderizar folders
async function folders(user, username) {
  try {
    const InformationFolder = collection(db, "users", user?.uid, "FolderInf");
    const querySnapshot = await getDocs(InformationFolder);

    querySnapshot.forEach((doc) => {
      const data = doc.data();

      const folderDiv = document.createElement("div");
      folderDiv.className = "folder";
      folderDiv.innerHTML = `
            <div class="header"><h2>${data.Name}</h2><button class="Delete" id="${data.Alias}" data-folder="${data.Name}">
            <img src="/icons/delete.svg" alt="Edit" /> 
            </button></div>
            <a href="/Folder/${data.Name}" class="folder-icon">
            <img src="./icons${data.Icon}" alt="folder" class="icon"/>
            </a>
          </div>
        `;

      box?.appendChild(folderDiv);

      document
        .querySelector(`#${data.Alias}`)
        ?.addEventListener("click", () => {
          deleteFolder(data.userId, username, data.Alias);
        });
    });
  } catch (error) {
    console.error("Error al obtener folders:", error);
  }
}

// Listener de auth
onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.href = `/`;
  }

  const docRef = doc(db, "users", user.uid);
  const docSnap = await getDoc(docRef);
  let data = docSnap.data();

  NumberFolders.textContent = `${data?.CreateCollections}/ ${data?.collection}`;

  // Crear nuevo folder
  form?.addEventListener("submit", async (e) => {
    e.preventDefault();

    const userSnap = await getDoc(docRef);
    const data = userSnap.data();

    if (Number(data?.CreateCollections) >= Number(data?.collection)) {
      return;
    }

    try {
      const name = document.querySelector(".Name");
      const alias = Name.value.trim().replace(/\s+/g, "-").toLowerCase();
      const folderRef = doc(db, "users", user.uid, "FolderInf", alias);

      await setDoc(folderRef, {
        userId: user.uid,
        Name: name.value,
        Icon: selectIcon.value,
        Alias: alias,
      });

      await updateDoc(docRef, {
        CreateCollections: increment(1),
      });

      window.location.href = `/Folder/${name.value}`;
    } catch (error) {
      console.log(error);
    }
  });

  // Vista previa del icono
  selectIcon?.addEventListener("change", () => {
    Icon.src = `./icons${selectIcon.value}`;
  });

  // Renderizar folders
  folders(user, data?.username);
});

// Mostrar formulario
openForm?.addEventListener("click", () => {
  sectionForm?.classList.remove("show");
});
