import React, { createContext, useContext, useState, useEffect } from 'react';

export type AIModel =
    | 'gemini-3-pro-preview'
    | 'gemini-3-flash-preview'
    | 'gemini-2.5-pro'
    | 'gemini-2.5-flash'
    | 'gemini-2.5-flash-preview-09-2025'
    | 'gemini-2.5-flash-image'
    | 'gemini-2.5-flash-native-audio-preview-12-2025'
    | 'gemini-2.0-flash-exp'
    | 'gemini-1.5-pro-latest'
    | 'gemini-1.5-pro'
    | 'gemini-1.5-flash';

interface SettingsContextType {
    aiModel: AIModel;
    setAiModel: (model: AIModel) => void;
}

const SettingsContext = createContext<SettingsContextType>({
    aiModel: 'gemini-1.5-pro-latest',
    setAiModel: () => { },
});

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [aiModel, setAiModel] = useState<AIModel>('gemini-1.5-pro-latest');

    useEffect(() => {
        const savedModel = localStorage.getItem('ai_model_preference');
        if (savedModel) {
            setAiModel(savedModel as AIModel);
        }
    }, []);

    const handleSetAiModel = (model: AIModel) => {
        setAiModel(model);
        localStorage.setItem('ai_model_preference', model);
    };

    return (
        <SettingsContext.Provider value={{ aiModel, setAiModel: handleSetAiModel }}>
            {children}
        </SettingsContext.Provider>
    );
};

export const useSettings = () => useContext(SettingsContext);
