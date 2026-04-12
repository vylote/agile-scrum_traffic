import { initializeApp } from "firebase/app";
import { getMessaging } from "firebase/messaging";

const firebaseConfig = {
    apiKey: "AIzaSyD61euRhXy2EW0COo9M869IeyeGt-n0Axo",
    authDomain: "incident-management-e0ec1.firebaseapp.com",
    projectId: "incident-management-e0ec1",
    storageBucket: "incident-management-e0ec1.firebasestorage.app",
    messagingSenderId: "937030266561",
    appId: "1:937030266561:web:01ea6bd694f257271d2e40",
    measurementId: "G-8BFJEJNGTE"
};

const app = initializeApp(firebaseConfig);

export const messaging = getMessaging(app);
export default app;