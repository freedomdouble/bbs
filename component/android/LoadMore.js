'use strict';

import React, { Component } from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default class LoadMore extends Component {

	constructor(props) {

		super(props);
	}

	render() {

		let body = null;

		if (this.props.loadMoreFlag == 1) {
			body = (
				<View style={{ alignItems: 'center', paddingVertical: 14, borderBottomWidth: StyleSheet.hairlineWidth, borderColor: '#ccc', backgroundColor: this.props.bgcolor }}>
					<Text style={{ color: '#ccc' }}>正在加载...</Text>
				</View>
			);
		}

		if (this.props.loadMoreFlag == 2) {
			body = (
				<View style={{ alignItems: 'center', paddingVertical: 14, borderBottomWidth: StyleSheet.hairlineWidth, borderColor: '#ccc', backgroundColor: this.props.bgcolor }}>
					<Text style={{ color: '#ccc' }}>就这么多了</Text>
				</View>
			);
		}

		return body;
	}
}
