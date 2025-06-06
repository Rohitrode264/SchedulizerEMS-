export interface InputFieldProps {
    label: string;
    type: string;
    name: string;  
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    icon?: React.ReactNode;
    required?: boolean;
    placeholder?: string;
}