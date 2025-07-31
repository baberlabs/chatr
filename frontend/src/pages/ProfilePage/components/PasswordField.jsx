import InputField from "./InputField";
import { useUpdatePassword } from "../hooks/useUpdatePassword";

const PasswordField = () => {
  const {
    password,
    passwordEditMode,
    setPassword,
    setPasswordEditMode,
    handlePasswordChange,
  } = useUpdatePassword();

  return (
    <InputField
      label="Password"
      type="password"
      value={passwordEditMode ? password : "*********"}
      setValue={setPassword}
      isEditing={passwordEditMode}
      toggleEdit={setPasswordEditMode}
      handleSave={handlePasswordChange}
    />
  );
};

export default PasswordField;
