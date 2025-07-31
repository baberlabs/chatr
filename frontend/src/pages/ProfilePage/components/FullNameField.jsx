import InputField from "./InputField";
import { useUpdateName } from "../hooks/useUpdateName";

const FullNameField = () => {
  const {
    fullName,
    fullNameEditMode,
    setFullName,
    setFullNameEditMode,
    handleFullNameChange,
  } = useUpdateName();

  return (
    <InputField
      label="Full Name"
      type="text"
      value={fullName}
      setValue={setFullName}
      isEditing={fullNameEditMode}
      toggleEdit={setFullNameEditMode}
      handleSave={handleFullNameChange}
    />
  );
};

export default FullNameField;
