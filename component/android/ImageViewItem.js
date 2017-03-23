'use strict';

import React, { Component } from 'react';
import { View, Dimensions } from 'react-native';
import Image from 'react-native-image-zoom';

const ScreenW = Dimensions.get('window').width;
const ScreenH = Dimensions.get('window').height;

export default class ImageViewItem extends Component {

	constructor(props) {

		super(props);
	}

	render() {

		return (
			<View style={{ flex: 1 }}>
				<View style={{ flex: 1, backgroundColor: '#000', alignItems: 'center', justifyContent: 'center' }}>
					<Image source={{ uri: this.props.uri }} style={{ width: ScreenW, flex: 1 }} onTap={() => { }} onLoad={() => { }} />
				</View>
			</View>
		);
	}
}