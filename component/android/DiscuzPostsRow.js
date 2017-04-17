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

export default class DiscuzPostsRow extends Component {

	constructor(props) {

		super(props);
	}

	_renderRow(rowData) {

		let _row = false;

		if (rowData.images.length >= 3) {
			_row = (
				<View style={{ paddingHorizontal: 12, paddingVertical: 9, borderBottomWidth: StyleSheet.hairlineWidth, borderColor: '#ccc', backgroundColor: '#fff' }}>
					<TouchableHighlight
						underlayColor="rgba(0,0,0,0)"
						onPress={() => {
							this.props.navigation.navigate('PostsDetail', { id: rowData.id, callBack: () => { } });
						}}
					>
						<View>
							<View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
								<Image style={{ width: 20, height: 20, borderRadius: 10 }} source={{ uri: rowData.avator }} />
								<Text style={{ color: '#222', fontSize: 12, marginLeft: 5 }}>{rowData.nickname}</Text>
							</View>
							<Text style={{ color: '#222', fontSize: 14, lineHeight: 20, textAlign: 'justify', flexWrap: 'wrap' }}>
								{rowData.title}
							</Text>
							<View style={{ flex: 1, flexDirection: 'row', paddingVertical: 7 }}>
								<View style={{ flex: 1, flexDirection: 'row' }}>
									<Image style={{ width: ImageWidth, height: ImageHeight, marginRight: 2 }} source={{ uri: rowData.images[0] }} />
									<Image style={{ width: ImageWidth, height: ImageHeight, marginRight: 2 }} source={{ uri: rowData.images[1] }} />
									<Image style={{ width: ImageWidth, height: ImageHeight }} source={{ uri: rowData.images[2] }} />
								</View>
							</View>
							<View style={{ flexDirection: 'row' }}>
								{rowData.is_top == '1' ? (<Text style={{ fontSize: 10, marginRight: 4, color: '#03c893' }}>置顶</Text>) : false}
								<Text style={{ fontSize: 10, marginRight: 4, color: '#ccc' }}>{rowData.created}</Text>
								<Text style={{ fontSize: 10, marginRight: 4, color: '#ccc' }}>{rowData.comment_account == 0 ? '暂无' : rowData.comment_account + '条'}评论</Text>
							</View>
						</View>
					</TouchableHighlight>
				</View>
			);
		}

		if (rowData.images.length == 1 || rowData.images.length == 2) {

			let ImgWidth = (ScreenW - 60) / 3;
			let ImgHeight = ScreenW / 3 * 0.6;

			_row = (
				<View style={{ paddingHorizontal: 12, paddingVertical: 10, borderBottomWidth: StyleSheet.hairlineWidth, borderColor: '#ccc', backgroundColor: '#fff' }}>
					<TouchableHighlight
						style={{ flex: 1 }}
						underlayColor="rgba(0,0,0,0)"
						onPress={() => {
							this.props.navigation.navigate('PostsDetail', { id: rowData.id, callBack: () => { } });
						}}
					>
						<View style={{ flexDirection: 'row' }}>
							<View style={{ flex: 1 }}>
								<View style={{ flexDirection: 'row', alignItems: 'center' }}>
									<Image style={{ width: 20, height: 20, borderRadius: 10 }} source={{ uri: rowData.avator }} />
									<Text style={{ color: '#222', fontSize: 12, marginLeft: 5 }}>{rowData.nickname}</Text>
								</View>
								<View style={{ flex: 1, paddingRight: 5, justifyContent: 'center' }}>
									<Text style={{ color: '#222', fontSize: 14, lineHeight: 20, textAlign: 'justify', flexWrap: 'wrap' }}>
										{rowData.title}
									</Text>
								</View>
								<View style={{ flexDirection: 'row' }}>
									{rowData.is_top == '1' ? (<Text style={{ fontSize: 10, marginRight: 4, color: '#03c893' }}>置顶</Text>) : false}
									<Text style={{ fontSize: 10, marginRight: 4, color: '#ccc' }}>{rowData.created}</Text>
									<Text style={{ fontSize: 10, marginRight: 4, color: '#ccc' }}>{rowData.comment_account == 0 ? '暂无' : rowData.comment_account + '条'}评论</Text>
								</View>
							</View>
							<Image style={{ width: ImgWidth, height: ImgHeight }} source={{ uri: rowData.images[0] }} />
						</View>
					</TouchableHighlight>
				</View>
			);
		}

		if (rowData.images.length == 0) {
			_row = (
				<View style={{ flexDirection: 'column', paddingHorizontal: 12, paddingVertical: 10, borderBottomWidth: StyleSheet.hairlineWidth, borderColor: '#ccc', backgroundColor: '#fff' }}>
					<TouchableHighlight
						style={{ flex: 1 }}
						underlayColor="rgba(0,0,0,0)"
						onPress={() => {
							this.props.navigation.navigate('PostsDetail', { id: rowData.id, callBack: () => { } });
						}}
					>
						<View>
							<View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 14 }}>
								<Image style={{ width: 20, height: 20, borderRadius: 10 }} source={{ uri: rowData.avator }} />
								<Text style={{ color: '#222', fontSize: 12, marginLeft: 5 }}>{rowData.nickname}</Text>
							</View>
							<Text style={{ color: '#222', fontSize: 14, lineHeight: 20, textAlign: 'justify', flexWrap: 'wrap' }}>
								{rowData.title}
							</Text>
							<View style={{ flexDirection: 'row', marginTop: 14 }}>
								{rowData.is_top == '1' ? (<Text style={{ fontSize: 10, marginRight: 4, color: '#03c893' }}>置顶</Text>) : false}
								<Text style={{ fontSize: 10, marginRight: 4, color: '#ccc' }}>{rowData.created}</Text>
								<Text style={{ fontSize: 10, marginRight: 4, color: '#ccc' }}>{rowData.comment_account == 0 ? '暂无' : rowData.comment_account + '条'}评论</Text>
							</View>
						</View>
					</TouchableHighlight>
				</View>
			);
		}

		return _row;
	}

	render() {

		return this._renderRow(this.props.rowData);
	}
}