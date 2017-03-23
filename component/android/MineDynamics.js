'use strict'

import React, { Component } from 'react';
import {
    View,
    Text,
    StatusBar,
    AsyncStorage,
    TouchableHighlight,
    ToastAndroid,
    Dimensions,
    Modal,
    TextInput,
    BackAndroid,
    ListView,
    RefreshControl
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import DynamicRow from './DynamicRow';
import LoadMore2 from './LoadMore2';

const ScreenW = Dimensions.get('window').width;

export default class MineDynamics extends Component {

    constructor(props) {

        super(props);
        this.ds = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 });
        this.submited = false;
        this.page = 1;
        this.isPageEnd = false;
        this.list = [];
        this.user = null;
        this.state = {
            refreshing: true,
            dataSource: this.ds.cloneWithRows([]),
            loadMoreFlag: 0,
            visible: false,
            wasReplyNickname: '',
            dynamic: { content: '', dynamic_id: 0, parent_id: 0 },
            rowId: 0,
            dynamicId: 0
        };
    }

    componentWillMount() {
        BackAndroid.addEventListener('hardwareBackPress', this._onBackAndroid);
    }

    componentWillUnmount() {
        BackAndroid.removeEventListener('hardwareBackPress', this._onBackAndroid);
    }

    _onBackAndroid = () => {
        this.props.navigation.goBack(null);
        return true;
    }

    async componentDidMount() {

        try {
            const user = await AsyncStorage.getItem('user');

            if (user !== null) {
                this.user = JSON.parse(user);
            }
        } catch (error) {
            ToastAndroid.show('存储异常', ToastAndroid.SHORT);
        }

        this._fetchData();
    }

    // 获取数据
    async _fetchData() {

        let url = 'http://121.11.71.33:8081/api/dynamic/list?flag=mine&page=' + this.page;

        console.log(url);

        try {
            let response = await fetch(url, { headers: { 'Authorization': this.user == null ? null : this.user.token } });
            var result = await response.json();
        } catch (error) {
            this.setState({ refreshing: false });
            ToastAndroid.show('网络错误', ToastAndroid.SHORT);
            return;
        }

        if (result.status == 1) {
            let dataLength = result.list.length;
            let loadMoreFlag = 0;

            if (dataLength < 10) {
                loadMoreFlag = 2;
                this.isPageEnd = true;
            }

            for (var i = 0; i < dataLength; i++) {
                this.list.push(result.list[i]);
            }

            this.page += 1;

            this.setState({ refreshing: false, dataSource: this.ds.cloneWithRows(this.list), loadMoreFlag: loadMoreFlag });
        }
        if (result.status == -1) {
            ToastAndroid.show(result.msg, ToastAndroid.SHORT);
            this.setState({ refreshing: false });
        }
    }

    // 下拉获取数据
    async _onRefresh() {

        this.setState({ refreshing: true });

        let url = 'http://121.11.71.33:8081/api/dynamic/list?flag=mine&page=1';

        console.log(url);

        try {
            let response = await fetch(url, { headers: { 'Authorization': this.user == null ? null : this.user.token } });
            var result = await response.json();
        } catch (error) {
            this.setState({ refreshing: false });
            ToastAndroid.show('网络错误', ToastAndroid.SHORT);
            return;
        }

        console.log(result);

        if (result.status == 1) {

            this.isPageEnd = false;
            this.page = 2;
            this.list = [];

            let dataLength = result.list.length;
            let loadMoreFlag = 0;

            if (dataLength < 10) {
                loadMoreFlag = 2;
                this.isPageEnd = true;
            }

            this.list = this.list.concat(result.list);
            this.setState({ dataSource: this.state.dataSource.cloneWithRows([]) });
            this.setState({ refreshing: false, dataSource: this.state.dataSource.cloneWithRows(this.list), loadMoreFlag: loadMoreFlag });
        }
        if (result.status == -1) {
            ToastAndroid.show(result.msg, ToastAndroid.SHORT);
            this.setState({ refreshing: false });
        }
    }

    _renderRow(rowData, sectionID, rowID) {

        return <DynamicRow rowData={rowData} user={this.user} rowID={rowID} navigation={this.props.navigation} callback={(wasReplyNickname, dynamic_id, parent_id, rowId) => {
            let dynamic = this.state.dynamic;
            dynamic.dynamic_id = dynamic_id;
            dynamic.parent_id = parent_id;
            this.setState({ dynamic: dynamic, wasReplyNickname: wasReplyNickname, visible: !this.state.visible, dynamicId: dynamic_id, rowId: rowId });
        }} />
    }

    // 提交评论
    async _onPressComment() {

        if (this.submited == true) {
            ToastAndroid.show('正在提交...', ToastAndroid.SHORT); return;
        }

        ToastAndroid.show('正在提交...', ToastAndroid.SHORT);

        this.submited = true;

        let data = new FormData();
        data.append('content', this.state.dynamic.content);
        data.append('dynamic_id', this.state.dynamic.dynamic_id);
        data.append('parent_id', this.state.dynamic.parent_id);

        const url = 'http://121.11.71.33:8081/api/dynamic/comment';

        console.log(url);

        try {
            let response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'Authorization': this.user == null ? null : this.user.token
                },
                body: data
            });
            var result = await response.json();
        } catch (error) {
            this.submited = false;
            ToastAndroid.show('网络错误', ToastAndroid.SHORT);
            return;
        }

        ToastAndroid.show(result.msg, ToastAndroid.SHORT);

        if (result.status == -1) {
            this.submited = false;
            return;
        }

        if (result.status == 1) {
            this._updateRowData();
            this.submited = false;
            return;
        }
    }

    // 更新某一行的数据
    async _updateRowData() {

        let url = 'http://121.11.71.33:8081/api/dynamic/detail?dynamic_id=' + this.state.dynamicId;

        console.log(url);

        try {
            let response = await fetch(url);
            var result = await response.json();
        } catch (error) {
            ToastAndroid.show('网络错误', ToastAndroid.SHORT);
            return;
        }

        if (result.status == -1) {
            ToastAndroid.show(result.msg, ToastAndroid.SHORT);
            return;
        }

        if (result.status == 1) {
            this.list[this.state.rowId].comments = result.dynamic.comments;
            this.list[this.state.rowId].comment_account = result.dynamic.comment_account;
            let list = this.list.slice(0);
            this.setState({ dataSource: this.ds.cloneWithRows(list), visible: !this.state.visible });
        }
    }

    render() {

        return (
            <View style={{ flex: 1 }}>
                <StatusBar backgroundColor="#03c893" />
                {/* 顶部导航栏 */}
                <View style={{ flexDirection: 'row', height: 45, paddingHorizontal: 12, alignItems: 'center', backgroundColor: '#03c893', }}>
                    <TouchableHighlight underlayColor="rgba(0,0,0,0)" onPress={() => { this.props.navigation.goBack(); }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <Icon name="ios-arrow-back-outline" size={22} color="#fff" style={{ marginTop: 1 }} />
                            <Text style={{ color: '#fff', fontSize: 16, marginLeft: 7 }}>我的动态</Text>
                        </View>
                    </TouchableHighlight>
                </View>
                <View style={{ flex: 1, backgroundColor: '#fff' }}>
                    <ListView
                        refreshControl={
                            <RefreshControl enabled={true} refreshing={this.state.refreshing} onRefresh={() => this._onRefresh()} progressBackgroundColor='#eee'
                                colors={['#ffaa66cc', '#ff00ddff']} />
                        }
                        showsVerticalScrollIndicator={true}
                        showsHorizontalScrollIndicator={false}
                        enableEmptySections={true}
                        renderFooter={() => <LoadMore2 loadMoreFlag={this.state.loadMoreFlag} />}
                        dataSource={this.state.dataSource}
                        onEndReached={() => {
                            if (this.state.refreshing == false && this.state.loadMoreFlag == 0 && this.isPageEnd == false) {
                                this.setState({ loadMoreFlag: 1 });
                                this._fetchData();
                            }
                        }}
                        renderRow={this._renderRow.bind(this)}
                    />
                </View>
                {/* 评论模态框 */}
                <Modal transparent={true} ref="modal" visible={this.state.visible} onRequestClose={() => this.setState({ visible: !this.state.visible })}>
                    <StatusBar backgroundColor="#000" />
                    <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.7)' }}>
                        <View style={{ flexDirection: 'row', backgroundColor: '#fff', width: ScreenW, zIndex: 1000, position: 'absolute', bottom: 0 }}>
                            <TextInput
                                style={{ flex: 1, height: 55, paddingHorizontal: 12 }}
                                placeholderTextColor="#ccc"
                                underlineColorAndroid="rgba(0,0,0,0)"
                                placeholder={this.state.wasReplyNickname == '' ? '请输入评论内容' : this.state.wasReplyNickname}
                                autoFocus={true}
                                multiline={true}
                                secureTextEntry={false}
                                onChangeText={(text) => {
                                    let dynamic = this.state.dynamic;
                                    dynamic.content = text;
                                    this.setState({ dynamic: dynamic });
                                }}
                                value={this.state.text}
                            />
                            <TouchableHighlight style={{ alignItems: 'center', height: 55, justifyContent: 'center', backgroundColor: '#03c893', paddingHorizontal: 12 }}
                                onPress={() => this._onPressComment()} underlayColor="rgba(0,0,0,0.1)">
                                <Text style={{ color: '#fff', fontSize: 16 }}>确定</Text>
                            </TouchableHighlight>
                        </View>
                    </View>
                </Modal>
            </View>
        );
    }
}