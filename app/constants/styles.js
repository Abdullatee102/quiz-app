import { StyleSheet } from 'react-native';
import { Colors } from './colors';

export const GlobalStyles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  headerTitle: {
    fontFamily: 'Archivo-Black',
    fontSize: 32,
    color: Colors.primary,
    marginBottom: 10,
    textTransform: 'uppercase',
  },
  subtitle: {
    fontFamily: 'Ubuntu-Regular',
    fontSize: 16,
    color: '#666',
    lineHeight: 22,
  },
  inputField: {
    backgroundColor: Colors.secondary + '40',
    padding: 18,
    borderRadius: 15,
    fontFamily: 'Ubuntu-Regular',
    fontSize: 16,
    color: Colors.text,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: Colors.secondary,
  },
  primaryBtn: {
    backgroundColor: Colors.primary,
    paddingVertical: 18,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 6,
    width: '100%',
  },
  btnText: {
    fontFamily: 'Ubuntu-Bold',
    color: Colors.white,
    fontSize: 18,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  }
});