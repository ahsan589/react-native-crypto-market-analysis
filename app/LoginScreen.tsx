import React, { useState } from "react";
import { 
  Text, 
  TextInput, 
  View, 
  StyleSheet, 
  TouchableOpacity, 
  KeyboardAvoidingView, 
  Platform,
  Image
} from "react-native";
import { FontAwesome } from '@expo/vector-icons';
import { useRouter } from "expo-router";
import LottieView from "lottie-react-native";

const Login = () => {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [alertVisible, setAlertVisible] = useState(false);
    const [alertMessage, setAlertMessage] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const validateEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    const handleLogin = async () => {
        if (!validateEmail(email)) {
            setAlertMessage("Please enter a valid email address");
            setAlertVisible(true);
            return;
        }
        if (password.length < 6) {
            setAlertMessage("Password must be at least 6 characters");
            setAlertVisible(true);
            return;
        }

        setIsLoading(true);
        try {
            const response = await fetch("http://192.168.43.28:3000/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.message || "Login failed");

            setAlertMessage("Login successful!");
            setAlertVisible(true);
            router.push("./dashboard");
        } catch (error: any) {
            setAlertMessage(error.message || "An error occurred during login");
            setAlertVisible(true);
        } finally {
            setIsLoading(false);
        }
    };

    const handleForgotPassword = () => {
        router.push("./ForgotPasswordScreen");
    };

    const handleSocialLogin = () => {
        // Handle social login logic
    
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.container}
        >
            <View style={styles.content}>
                {/* Lottie Animation */}
                <LottieView
                    source={require("@/assets/lottie/loin.json")}
                    autoPlay
                    loop
                    style={styles.animation}
                />

                {/* Header Text */}
                <Text style={styles.title}>Welcome Back</Text>
                <Text style={styles.subtitle}>Secure your crypto journey with us</Text>

                {/* Login Form */}
                <View style={styles.form}>
                    {/* Email Input */}
                    <View style={styles.inputContainer}>
                        <FontAwesome name="envelope" size={20} color="#03A9F4" style={styles.icon} />
                        <TextInput
                            placeholder="Email"
                            placeholderTextColor="#999"
                            style={styles.input}
                            value={email}
                            onChangeText={setEmail}
                            keyboardType="email-address"
                            autoCapitalize="none"
                        />
                    </View>

                    {/* Password Input */}
                    <View style={styles.inputContainer}>
                        <FontAwesome name="lock" size={20} color="#03A9F4" style={styles.icon} />
                        <TextInput
                            placeholder="Password"
                            placeholderTextColor="#999"
                            style={styles.input}
                            secureTextEntry={!showPassword}
                            value={password}
                            onChangeText={setPassword}
                        />
                        <TouchableOpacity
                            onPress={() => setShowPassword(!showPassword)}
                            style={styles.eyeIcon}
                        >
                            <FontAwesome
                                name={showPassword ? "eye" : "eye-slash"}
                                size={20}
                                color="#03A9F4"
                            />
                        </TouchableOpacity>
                    </View>

                    {/* Forgot Password */}
                    <TouchableOpacity 
                        style={styles.forgotPasswordContainer}
                        onPress={handleForgotPassword}
                    >
                        <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
                    </TouchableOpacity>

                    {/* Login Button */}
                    <TouchableOpacity
                        style={[styles.button, isLoading && styles.disabledButton]}
                        onPress={handleLogin}
                        disabled={isLoading}
                    >
                        <Text style={styles.buttonText}>
                            {isLoading ? "Processing..." : "Sign In"}
                        </Text>
                    </TouchableOpacity>

                    {/* Divider */}
                    <View style={styles.dividerContainer}>
                        <View style={styles.dividerLine} />
                        <Text style={styles.dividerText}>OR</Text>
                        <View style={styles.dividerLine} />
                    </View>

                    {/* Social Login Options */}
                    <View style={styles.socialButtonsContainer}>
                
                    <TouchableOpacity 
                        style={styles.socialButton}
                        onPress={() => handleSocialLogin()}
                    >
                        <FontAwesome name="google" size={24} color="#DB4437" />
                    </TouchableOpacity>
                    
                    <TouchableOpacity 
                        style={styles.socialButton}
                        onPress={() => handleSocialLogin()}
                    >
                        <FontAwesome name="facebook" size={24} color="#4267B2" />
                    </TouchableOpacity>
                    
                    <TouchableOpacity 
                        style={styles.socialButton}
                        onPress={() => handleSocialLogin()}
                    >
                        <FontAwesome name="github" size={24} color="#333" />
                    </TouchableOpacity>
                    </View>

            

                    {/* Sign Up Link */}
                    <TouchableOpacity
                        style={styles.signupContainer}
                        onPress={() => router.push("./SignupScreen")}
                    >
                        <Text style={styles.signupText}>
                            Don't have an account?{" "}
                            <Text style={styles.signupLink}>Create Account</Text>
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* Custom Alert */}
                {alertVisible && (
                    <View style={styles.alertContainer}>
                        <View style={styles.alert}>
                            <Text style={styles.alertTitle}>Notification</Text>
                            <Text style={styles.alertMessage}>{alertMessage}</Text>
                            <TouchableOpacity
                                style={styles.alertButton}
                                onPress={() => setAlertVisible(false)}
                            >
                                <Text style={styles.alertButtonText}>OK</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                )}
            </View>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#FFF",
    },
    content: {
        flex: 1,
        justifyContent: "center",
        padding: 30,
    },
    animation: {
        width: 150,
        height: 150,
        alignSelf: "center",
    },
    title: {
        fontSize: 28,
        fontWeight: "bold",
        color: "#03A9F4",
        textAlign: "center",
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: "#666",
        textAlign: "center",
        marginBottom: 40,
    },
    form: {
        backgroundColor: "#FFF",
        borderRadius: 15,
        padding: 20,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
        elevation: 3,
    },
    inputContainer: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#FFFFFF",
        borderRadius: 10,
        paddingHorizontal: 15,
        paddingVertical: 12,
        marginBottom: 15,
        borderWidth: 1,
        borderColor: "#E0E0E0",
    },
    icon: {
        marginRight: 10,
    },
    input: {
        flex: 1,
        fontSize: 16,
        color: "#333",
    },
    eyeIcon: {
        padding: 8,
    },
    button: {
        backgroundColor: "#03A9F4",
        borderRadius: 10,
        padding: 15,
        alignItems: "center",
        marginTop: 20,
        shadowColor: "#03A9F4",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 6,
        elevation: 5,
    },
    disabledButton: {
        opacity: 0.7,
    },
    buttonText: {
        color: "#FFFFFF",
        fontSize: 16,
        fontWeight: "600",
    },
    forgotPasswordContainer: {
        alignItems: "flex-end",
        marginBottom: 10,
    },
    forgotPasswordText: {
        color: "#03A9F4",
        fontSize: 14,
    },
    dividerContainer: {
        flexDirection: "row",
        alignItems: "center",
        marginVertical: 20,
    },
    dividerLine: {
        flex: 1,
        height: 1,
        backgroundColor: "#E0E0E0",
    },
    dividerText: {
        width: 50,
        textAlign: "center",
        color: "#666",
    },
    socialButtonsContainer: {
        flexDirection: "row",
        justifyContent: "center",
        marginBottom: 20,
    },
    socialButton: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: "#F0F0F0",
        justifyContent: "center",
        alignItems: "center",
        marginHorizontal: 10,
        elevation: 2,
      },
      
    socialIcon: {
        width: 30,
        height: 30,
    },
    signupContainer: {
        marginTop: 10,
        alignItems: "center",
    },
    signupText: {
        color: "#666",
        fontSize: 14,
    },
    signupLink: {
        color: "#03A9F4",
        fontWeight: "600",
    },
    alertContainer: {
        position: "absolute",
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: "rgba(0,0,0,0.5)",
        justifyContent: "center",
        alignItems: "center",
    },
    alert: {
        backgroundColor: "white",
        borderRadius: 15,
        padding: 20,
        width: "80%",
    },
    alertTitle: {
        fontSize: 18,
        fontWeight: "bold",
        marginBottom: 10,
        color: "#333",
    },
    alertMessage: {
        fontSize: 16,
        color: "#666",
        marginBottom: 20,
    },
    alertButton: {
        backgroundColor: "#03A9F4",
        borderRadius: 8,
        padding: 12,
        alignItems: "center",
    },
    alertButtonText: {
        color: "white",
        fontSize: 16,
        fontWeight: "600",
    },
});

export default Login;