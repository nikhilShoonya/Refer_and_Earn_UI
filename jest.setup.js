// expo-clipboard touches a native module that has no JS fallback under Jest.
jest.mock('expo-clipboard', () => ({ setStringAsync: jest.fn().mockResolvedValue(true) }));
