import { firebaseAuth } from "../../firebase/index";

export const returnUserId = () => firebaseAuth.currentUser.uid;

export const signOutUser = () => firebaseAuth.signOut();

export const signUpWithPhone = (phoneNumber, appVerifier) =>
  firebaseAuth.signInWithPhoneNumber(phoneNumber, appVerifier);
