import React, { useState } from "react";
import {
  Text,
  TextInput,
  View,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Modal
} from "react-native";
import CustomAlert from "@/components/CustomAlert";
import { FontAwesome } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import LottieView from "lottie-react-native";

export default function SignUp() {
    const router = useRouter();
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [otp, setOtp] = useState("");
    const [isOtpVisible, setIsOtpVisible] = useState(false);
    const [alertVisible, setAlertVisible] = useState(false);
    const [alertMessage, setAlertMessage] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const validateEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    const showAlert = (message: string) => {
        setAlertMessage(message);
        setAlertVisible(true);
    };

    const onRegister = async () => {
        if (!name || !email || !password || !confirmPassword) {
            showAlert("All fields are required");
            return;
        }

        if (!validateEmail(email)) {
            showAlert("Please enter a valid email address");
            return;
        }

        if (password.length < 6) {
            showAlert("Password must be at least 6 characters");
            return;
        }

        if (password !== confirmPassword) {
            showAlert("Passwords do not match");
            return;
        }

        setIsLoading(true);
        try {
            const response = await fetch("http://192.168.43.28:3000/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, email, password }),
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.message || "Registration failed");

            showAlert("Registration successful! Check your email for OTP");
            setIsOtpVisible(true);
        } catch (error: any) {
            showAlert(error.message || "Registration failed. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const onVerifyOtp = async () => {
        if (!otp || otp.length !== 6) {
            showAlert("Please enter a valid 6-digit OTP");
            return;
        }

        setIsLoading(true);
        try {
            const response = await fetch("http://192.168.43.28:3000/verify-otp", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, otp }),
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.message || "OTP verification failed");

            showAlert("Account verified successfully!");
            router.push("./LoginScreen");
        } catch (error: any) {
            showAlert(error.message || "OTP verification failed");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.container}
        >
            <View style={styles.content}>
                <LottieView
                    source={require("@/assets/lottie/sig.json")}
                    autoPlay
                    loop
                    style={styles.animation}
                />

                <Text style={styles.title}>Create Account</Text>
                <Text style={styles.subtitle}>Secure your crypto journey with us</Text>

                <View style={styles.form}>
                    {/* Registration Form Inputs... */}
                    {/* Name Input */}
                    <View style={styles.inputContainer}>
                        <FontAwesome name="user" size={20} color="#03A9F4" style={styles.icon} />
                        <TextInput
                            placeholder="Full Name"
                            placeholderTextColor="#999"
                            style={styles.input}
                            value={name}
                            onChangeText={setName}
                        />
                    </View>

                    {/* Email Input */}
                    <View style={styles.inputContainer}>
                        <FontAwesome name="envelope" size={20} color="#03A9F4" style={styles.icon} />
                        <TextInput
                            placeholder="Email Address"
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

                    {/* Confirm Password Input */}
                    <View style={styles.inputContainer}>
                        <FontAwesome name="lock" size={20} color="#03A9F4" style={styles.icon} />
                        <TextInput
                            placeholder="Confirm Password"
                            placeholderTextColor="#999"
                            style={styles.input}
                            secureTextEntry={!showPassword}
                            value={confirmPassword}
                            onChangeText={setConfirmPassword}
                        />
                    </View>
                    <TouchableOpacity
                        style={[styles.button, isLoading && styles.disabledButton]}
                        onPress={onRegister}
                        disabled={isLoading}
                    >
                        <Text style={styles.buttonText}>
                            {isLoading ? "Processing..." : "Create Account"}
                        </Text>
                    </TouchableOpacity>

                    {/* OTP Dialog */}
                    <Modal
                        visible={isOtpVisible}
                        transparent={true}
                        animationType="fade"
                    >
                        <View style={styles.otpBackdrop}>
                            <View style={styles.otpDialog}>
                                <Text style={styles.otpTitle}>Verify Email</Text>
                                <Text style={styles.otpSubtitle}>
                                    Enter the 6-digit code sent to {email}
                                </Text>

                                <View style={styles.inputContainer}>
                                    <FontAwesome name="key" size={20} color="#03A9F4" style={styles.icon} />
                                    <TextInput
                                        placeholder="Enter OTP"
                                        placeholderTextColor="#999"
                                        style={styles.input}
                                        value={otp}
                                        onChangeText={setOtp}
                                        keyboardType="numeric"
                                        maxLength={6}
                                        autoFocus
                                    />
                                </View>

                                <TouchableOpacity
                                    style={[styles.button, isLoading && styles.disabledButton]}
                                    onPress={onVerifyOtp}
                                    disabled={isLoading}
                                >
                                    <Text style={styles.buttonText}>
                                        {isLoading ? "Verifying..." : "Verify OTP"}
                                    </Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={styles.cancelButton}
                                    onPress={() => setIsOtpVisible(false)}
                                >
                                    <Text style={styles.cancelText}>Cancel</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </Modal>

                    <TouchableOpacity
                        style={styles.loginContainer}
                        onPress={() => router.push("./LoginScreen")}
                    >
                        <Text style={styles.loginText}>
                            Already have an account?{" "}
                            <Text style={styles.loginLink}>Sign In</Text>
                        </Text>
                    </TouchableOpacity>
                </View>

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
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#FFF",
    },
    content: {
        flex: 1,
        justifyContent: "center",
        padding: 25,
    },
    animation: {
        width: 150,
        height: 150,
        alignSelf: "center",
        marginBottom: 10,
    },
    title: {
        fontSize: 28,
        fontWeight: "bold",
        color: "#03A9F4",
        textAlign: "center",
        marginBottom: 8,
        fontFamily: "Roboto-Bold",
    },
    subtitle: {
        fontSize: 16,
        color: "#666",
        textAlign: "center",
        marginBottom: 30,
        fontFamily: "Roboto-Regular",
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
        marginRight: 15,
    },
    input: {
        flex: 1,
        fontSize: 16,
        color: "#333",
        paddingVertical: 8,
        fontFamily: "Roboto-Regular",
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
        textAlign: "center",
        fontFamily: "Roboto-Medium",
    },
    otpContainer: {
        marginTop: 20,
        paddingTop: 20,
        borderTopWidth: 1,
        borderTopColor: "#EEE",
    },
    otpBackdrop: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.5)",
        justifyContent: "center",
        alignItems: "center",
    },
    otpDialog: {
        backgroundColor: "#FFF",
        borderRadius: 15,
        padding: 25,
        width: "85%",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    otpTitle: {
        fontSize: 22,
        fontWeight: "bold",
        color: "#03A9F4",
        textAlign: "center",
        marginBottom: 10,
    },
    otpSubtitle: {
        fontSize: 14,
        color: "#666",
        textAlign: "center",
        marginBottom: 20,
    },
    cancelButton: {
        marginTop: 15,
        padding: 10,
        alignItems: "center",
    },
    cancelText: {
        color: "#03A9F4",
        fontWeight: "600",
    },

    loginContainer: {
        flexDirection: "row",
        justifyContent: "center",
        marginTop: 25,
    },
    loginText: {
        color: "#666",
        fontSize: 14,
        fontFamily: "Roboto-Regular",
    },
    loginLink: {
        color: "#03A9F4",
        fontWeight: "600",
        fontFamily: "Roboto-Medium",
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