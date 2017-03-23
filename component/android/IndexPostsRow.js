'use strict';

import React, { Component } from 'react';
import {
	View,
	Text,
	Image,
	Dimensions,
	StyleSheet,
	TouchableHighlight
} from 'react-native';

const ScreenW = Dimensions.get('window').width;
const ImageWidth = (ScreenW - 28) / 3;
const ImageHeight = ScreenW / 3 * 0.65;

export default class IndexPostsRow extends Component {

	constructor(props) {

		super(props);
	}

	_renderRow(rowData) {

		let row = false;
		let comment_account = '暂无';

		if (rowData.comment_account > 0) {
			comment_account = rowData.comment_account + '条';
		}

		if (rowData.thumb.length >= 3) {
			row = (
				<View style={{ paddingHorizontal: 12, paddingVertical: 9, borderBottomWidth: StyleSheet.hairlineWidth, borderColor: '#ccc', backgroundColor: '#fff' }}>
					<TouchableHighlight
						underlayColor="rgba(0,0,0,0)"
						onPress={() => { this.props.navigation.navigate('PostsDetail', { id: rowData.associated_id, callBack: () => { } }); }}
					>
						<View>
							<Text style={{ color: '#222', fontSize: 14, lineHeight: 20, textAlign: 'justify', flexWrap: 'wrap' }}>
								{rowData.short_title}
							</Text>
							<View style={{ flex: 1, flexDirection: 'row', paddingVertical: 7 }}>
								<View style={{ flex: 1, flexDirection: 'row' }}>
									<Image style={{ width: ImageWidth, height: ImageHeight, marginRight: 2 }} source={{ uri: rowData.thumb[0] }} />
									<Image style={{ width: ImageWidth, height: ImageHeight, marginRight: 2 }} source={{ uri: rowData.thumb[1] }} />
									<Image style={{ width: ImageWidth, height: ImageHeight }} source={{ uri: rowData.thumb[2] }} />
								</View>
							</View>
							<View style={{ flexDirection: 'row' }}>
								<Text style={{ fontSize: 10, marginRight: 4, color: '#ccc' }}>{rowData.created}</Text>
								<Text style={{ fontSize: 10, marginRight: 4, color: '#ccc' }}>{comment_account}评论</Text>
								{rowData.tag == '' ? null : (<Text style={{ fontSize: 10, marginRight: 4, color: '#ccc' }}>{rowData.tag}</Text>)}
							</View>
						</View>
					</TouchableHighlight>
				</View>
			);
		}

		if (rowData.thumb.length == 1) {

			let ImgWidth = (ScreenW - 60) / 3;
			let ImgHeight = ScreenW / 3 * 0.6;

			row = (
				<View style={{ paddingHorizontal: 12, paddingVertical: 10, borderBottomWidth: StyleSheet.hairlineWidth, borderColor: '#ccc', backgroundColor: '#fff' }}>
					<TouchableHighlight
						style={{ flex: 1 }}
						underlayColor="rgba(0,0,0,0)"
						onPress={() => { this.props.navigation.navigate('PostsDetail', { id: rowData.associated_id, callBack: () => { } }); }}
					>
						<View style={{ flexDirection: 'row' }}>
							<View style={{ flex: 1 }}>
								<View style={{ flex: 1, paddingRight: 5 }}>
									<Text style={{ color: '#222', fontSize: 14, lineHeight: 20, textAlign: 'justify', flexWrap: 'wrap' }}>
										{rowData.short_title}
									</Text>
								</View>
								<View style={{ flexDirection: 'row' }}>
									<Text style={{ fontSize: 10, marginRight: 4, color: '#ccc' }}>{rowData.created}</Text>
									<Text style={{ fontSize: 10, marginRight: 4, color: '#ccc' }}>{comment_account}评论</Text>
									{rowData.tag == '' ? null : (<Text style={{ fontSize: 10, marginRight: 4, color: '#ccc' }}>{rowData.tag}</Text>)}
								</View>
							</View>
							<Image style={{ width: ImgWidth, height: ImgHeight }} source={{ uri: rowData.thumb[0] }} />
						</View>
					</TouchableHighlight>
				</View>
			);
		}

		if (rowData.thumb.length == 0) {
			row = (
				<View style={{ flexDirection: 'column', paddingHorizontal: 12, paddingVertical: 10, borderBottomWidth: StyleSheet.hairlineWidth, borderColor: '#ccc', backgroundColor: '#fff' }}>
					<TouchableHighlight
						style={{ flex: 1 }}
						underlayColor="rgba(0,0,0,0)"
						onPress={() => { this.props.navigation.navigate('PostsDetail', { id: rowData.associated_id, callBack: () => { } }); }}
					>
						<View>
							<Text style={{ color: '#222', fontSize: 14, lineHeight: 20, textAlign: 'justify', flexWrap: 'wrap' }}>
								{rowData.short_title}
							</Text>
							<View style={{ flexDirection: 'row', marginTop: 32 }}>
								<Text style={{ fontSize: 10, marginRight: 4, color: '#ccc' }}>{rowData.created}</Text>
								<Text style={{ fontSize: 10, marginRight: 4, color: '#ccc' }}>{comment_account}评论</Text>
								{rowData.tag == '' ? null : (<Text style={{ fontSize: 10, marginRight: 4, color: '#ccc' }}>{rowData.tag}</Text>)}
							</View>
						</View>
					</TouchableHighlight>
				</View>
			);
		}

		return row;
	}

	render() {

		return this._renderRow(this.props.rowData);
	}
}