'use strict';

import React, { Component } from 'react';
import { View, Dimensions } from 'react-native';
import ImageSizing01 from './ImageSizing01';

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
					<ImageSizing01 uri={this.props.uri} width={ScreenW} height={ScreenH} />
				</View>
			</View>
		);
	}
}