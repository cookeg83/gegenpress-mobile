import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  // General Layout
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f8f9fa', // Website's background color
  },

  // Typography
  header: {
    fontFamily: 'Segoe UI', // Matches your website
    fontSize: 24,
    fontWeight: '500',
    marginBottom: 16,
    color: '#212529', // Website's text color
  },
  text: {
    fontFamily: 'Segoe UI',
    fontSize: 16,
    color: '#495057',
  },

  // Buttons
  button: {
    backgroundColor: '#007bff', // Primary button color
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },

  // Picker
  picker: {
    height: 50,
    width: '100%',
    backgroundColor: '#fff',
    borderColor: '#ced4da',
    borderWidth: 1,
    borderRadius: 4,
    marginBottom: 16,
    paddingHorizontal: 8,
    color: '#495057',
  },
});

// Image
  image: {
    width: 100, // Adjust to fit the grid, or calculate dynamically
    height: 100, // Make it square
    margin: 5, // Add spacing between images
    resizeMode: 'cover', // Ensure the image fills its container without distortion
    borderRadius: 8, // Optional for rounded corners
  },

export default styles;
