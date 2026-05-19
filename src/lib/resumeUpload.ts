import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { doc, serverTimestamp, updateDoc } from "firebase/firestore";
import { storage, db } from "./firebase";

const MAX_BYTES = 5 * 1024 * 1024;

export async function uploadUserResume(uid: string, file: File): Promise<string> {
  if (file.type !== "application/pdf") {
    throw new Error("Resume must be a PDF file");
  }
  if (file.size > MAX_BYTES) {
    throw new Error("Resume must be under 5 MB");
  }

  const storagePath = `resumes/${uid}/resume.pdf`;
  const storageRef = ref(storage, storagePath);
  await uploadBytes(storageRef, file, { contentType: "application/pdf" });
  const resumeUrl = await getDownloadURL(storageRef);

  await updateDoc(doc(db, "users", uid), {
    resumeUrl,
    resumeStoragePath: storagePath,
    resumeFileName: file.name,
    resumeUpdatedAt: serverTimestamp(),
  });

  return resumeUrl;
}
