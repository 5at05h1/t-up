import React from 'react';
import { StyleSheet, View, ActivityIndicator } from 'react-native';

export default function Loading(props) {
  const { isLoading } = props;
  if (!isLoading) {
    return null;
  }
  return (
    <View style={styles.container}>
      <View style={styles.inner}>
        <ActivityIndicator
          size="large"
          color="#1f2d53"
        />
      </View>
    </View>
  );
}

Loading.defaultProps = {
  isLoading: false,
};

const styles = StyleSheet.create({
  container: {
    flex:1,
    position: 'absolute',
    width: '100%',
    height: '100%',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.2)',
    zIndex: 1000,
  },
});
