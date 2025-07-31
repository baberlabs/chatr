import InputField from "./InputField";
import { useUpdateEmail } from "../hooks/useUpdateEmail";

const EmailField = () => {
  const {
    email,
    emailEditMode,
    setEmail,
    setEmailEditMode,
    handleEmailChange,
  } = useUpdateEmail();

  return (
    <InputField
      label="Email"
      type="email"
      value={email}
      setValue={setEmail}
      isEditing={emailEditMode}
      toggleEdit={setEmailEditMode}
      handleSave={handleEmailChange}
    />
  );
};

export default EmailField;
