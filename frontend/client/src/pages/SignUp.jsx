import SignUpContent from "../components/signup/SignUpContent";
import AuthContextProvider from "../context/AuthContextProvider";

/**
 * The main SignUp page.
 * It wraps the SignUpContent with the AuthContextProvider to provide
 * all necessary authentication state and logic.
 */
export default function SignUp() {
    return (
            <SignUpContent />
    )
}
