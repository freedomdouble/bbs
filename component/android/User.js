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
    BackAndroid,
    StyleSheet,
    Image as DefaulImage,
    ActivityIndicator,
    RefreshControl,
    ListView,
    ViewPagerAndroid,
    Modal,
    TextInput
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import DynamicRow from './DynamicRow';
import IndexPostsRow from './IndexPostsRow';
import LoadMore2 from './LoadMore2';

const ScreenW = Dimensions.get('window').width;

export default class User extends Component {

    constructor(props) {
        super(props);

        this.ds = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 });
        this.user = null;
        this.submited = false;
        this._viewPage = {};
        this.dynamicObject = { page: 1, isPageEnd: false, list: [] };
        this.postsObject = { page: 1, isPageEnd: false, list: [] };
        this.LoadedFocus = false;
        this.loadedFans = false;
        this.dynamicId = 0;
        this.rowId = 0;

        this.state = {
            currTabel: 0,
            refreshing: true,
            visible: false,
            wasReplyNickname: '',
            data: null,
            dynamicObject: { dataSource: this.ds.cloneWithRows([]), loadMoreFlag: 0 },
            postsObject: { dataSource: this.ds.cloneWithRows([]), loadMoreFlag: 0 },
            focusDataSource: this.ds.cloneWithRows([]),
            fansDataSource: this.ds.cloneWithRows([]),
            dynamic: { content: '', dynamic_id: 0, parent_id: 0 }
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
        this._fetchDynamics();
    }

    async _fetchData() {

        let url = 'http://121.11.71.33:8081/api/user/info?id=' + this.props.navigation.state.params.id;

        console.log(url);

        try {
            let response = await fetch(url, { headers: { 'Authorization': this.user == null ? null : this.user.token } });
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
            this.setState({ data: result.data });
        }
    }

    // 添加关注 | 取消关注
    async _focus() {

        if (this.submited == true) {
            ToastAndroid.show('正在提交数据...', ToastAndroid.SHORT);
            return;
        }

        ToastAndroid.show('提交数据...', ToastAndroid.SHORT);

        this.submited = true;

        let data = new FormData();
        data.append('user_id', this.state.data.id);
        data.append('focus', this.state.data.is_focus);

        let url = 'http://121.11.71.33:8081/api/user/focus';

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

        this.submited = false;

        ToastAndroid.show(result.msg, ToastAndroid.SHORT);

        if (result.status == 0) {
            this.props.navigation.navigate('Login');
            return;
        }
        if (result.status == 1) {
            let data = this.state.data;
            data.is_focus = data.is_focus == 1 ? 0 : 1;
            this.setState({ data: data });
        }
    }

    // 这里处理点赞操作
    async _onPressLike() {

        if (this.user == null) {
            this.props.navigation.navigate('Login'); return;
        }

        if (this.submited == true) {
            ToastAndroid.show('正在提交...', ToastAndroid.SHORT); return;
        }

        ToastAndroid.show('正在提交...', ToastAndroid.SHORT);

        this.submited = true;

        let data = new FormData();
        data.append('dynamic_id', this.dynamicId);

        const url = 'http://121.11.71.33:8081/api/dynamic/like';

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

        let url = 'http://121.11.71.33:8081/api/dynamic/detail?dynamic_id=' + this.dynamicId;

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
            this.dynamicObject.list[this.rowId].likes = result.dynamic.likes;
            this.dynamicObject.list[this.rowId].comments = result.dynamic.comments;
            this.dynamicObject.list[this.rowId].comment_account = result.dynamic.comment_account;
            let list = this.dynamicObject.list.slice(0);
            let dynamicObject = this.state.dynamicObject;
            dynamicObject.dataSource = this.ds.cloneWithRows(list);
            this.setState({ dynamicObject: dynamicObject, visible: false });
        }
    }

    async _fetchDynamics() {
        let url = 'http://121.11.71.33:8081/api/dynamic/list?flag=user&page=' + this.dynamicObject.page + '&user_id=' + this.props.navigation.state.params.id;

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
                this.dynamicObject.isPageEnd = true;
            }

            if (dataLength == 0 && this.state.dynamicObject.dataSource.getRowCount() == 0) {
                loadMoreFlag = 0;
            }

            for (var i = 0; i < dataLength; i++) {
                this.dynamicObject.list.push(result.list[i]);
            }

            this.dynamicObject.page += 1;

            let dynamicObject = this.state.dynamicObject;
            dynamicObject.dataSource = this.ds.cloneWithRows(this.dynamicObject.list);
            dynamicObject.loadMoreFlag = loadMoreFlag;

            this.setState({ refreshing: false, dynamicObject: dynamicObject });
        }
        if (result.status == -1) {
            ToastAndroid.show(result.msg, ToastAndroid.SHORT);
            this.setState({ refreshing: false });
        }
    }

    async _onRefreshDynamics() {
        this.setState({ refreshing: true });

        let url = 'http://121.11.71.33:8081/api/dynamic/list?flag=user&page=1&user_id=' + this.props.navigation.state.params.id;

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

            this.dynamicObject.isPageEnd = false;
            this.dynamicObject.page = 2;
            this.dynamicObject.list = [];

            let dataLength = result.list.length;
            let loadMoreFlag = 0;

            if (dataLength < 10) {
                loadMoreFlag = 2;
                this.dynamicObject.isPageEnd = true;
            }

            if (dataLength == 0) {
                loadMoreFlag = 0;
            }

            let dynamicObject = this.state.dynamicObject;
            dynamicObject.dataSource = this.ds.cloneWithRows([]);
            this.setState({ dynamicObject: dynamicObject });

            this.dynamicObject.list = this.dynamicObject.list.concat(result.list);
            dynamicObject.dataSource = this.ds.cloneWithRows(this.dynamicObject.list);
            dynamicObject.loadMoreFlag = loadMoreFlag;
            this.setState({ refreshing: false, dynamicObject });

            ToastAndroid.show('刷新成功', ToastAndroid.SHORT);
        }
        if (result.status == -1) {
            ToastAndroid.show(result.msg, ToastAndroid.SHORT);
            this.setState({ refreshing: false });
        }
    }

    async _fetchPosts() {
        let url = 'http://121.11.71.33:8081/api/posts/other?page=' + this.postsObject.page + '&user_id=' + this.props.navigation.state.params.id;

        console.log(url);

        try {
            let response = await fetch(url);
            var result = await response.json();
        } catch (error) {
            this.setState({ refreshing: false });
            ToastAndroid.show('网络错误', ToastAndroid.SHORT);
            return;
        }

        if (result.status == 1) {
            let dataLength = result.list.length;
            let loadMoreFlag = 0;

            if (dataLength < 15) {
                loadMoreFlag = 2;
                this.postsObject.isPageEnd = true;
            }

            if (dataLength == 0 && this.state.postsObject.dataSource.getRowCount() == 0) {
                loadMoreFlag = 0;
            }

            for (var i = 0; i < dataLength; i++) {
                this.postsObject.list.push(result.list[i]);
            }

            this.postsObject.page += 1;

            let postsObject = this.state.postsObject;
            postsObject.dataSource = this.ds.cloneWithRows(this.postsObject.list);
            postsObject.loadMoreFlag = loadMoreFlag;

            this.setState({ refreshing: false, postsObject: postsObject });
        }
        if (result.status == -1) {
            ToastAndroid.show(result.msg, ToastAndroid.SHORT);
            this.setState({ refreshing: false });
        }
    }

    async _onRefreshPosts() {
        this.setState({ refreshing: true });

        let url = 'http://121.11.71.33:8081/api/posts/other?page=1&user_id=' + this.props.navigation.state.params.id;

        console.log(url);

        try {
            let response = await fetch(url);
            var result = await response.json();
        } catch (error) {
            this.setState({ refreshing: false });
            ToastAndroid.show('网络错误', ToastAndroid.SHORT);
            return;
        }

        if (result.status == 1) {

            this.postsObject.isPageEnd = false;
            this.postsObject.page = 2;
            this.postsObject.list = [];

            let dataLength = result.list.length;
            let loadMoreFlag = 0;

            if (dataLength < 15) {
                loadMoreFlag = 2;
                this.postsObject.isPageEnd = true;
            }

            if (dataLength == 0) {
                loadMoreFlag = 0;
            }

            this.postsObject.list = this.postsObject.list.concat(result.list);

            let postsObject = this.state.postsObject;
            postsObject.dataSource = this.ds.cloneWithRows(this.postsObject.list);
            postsObject.loadMoreFlag = loadMoreFlag;
            this.setState({ refreshing: false, postsObject: postsObject });

            ToastAndroid.show('刷新成功', ToastAndroid.SHORT);
        }
        if (result.status == -1) {
            ToastAndroid.show(result.msg, ToastAndroid.SHORT);
            this.setState({ refreshing: false });
        }
    }

    async _fetchFocus() {

        this.setState({ refreshing: true });

        let url = 'http://121.11.71.33:8081/api/user/relative?flag=focus&user_id=' + this.props.navigation.state.params.id;

        console.log(url);

        try {
            let response = await fetch(url);
            var result = await response.json();
        } catch (error) {
            this.setState({ refreshing: false });
            ToastAndroid.show('网络错误', ToastAndroid.SHORT);
            return;
        }

        if (result.status == 1) {
            this.LoadedFocus = true;
            this.setState({ refreshing: false, focusDataSource: this.ds.cloneWithRows(result.list) });
        }
        if (result.status == -1) {
            ToastAndroid.show(result.msg, ToastAndroid.SHORT);
            this.setState({ refreshing: false });
        }
    }

    async _fetchFans() {
        this.setState({ refreshing: true });

        let url = 'http://121.11.71.33:8081/api/user/relative?flag=fans&user_id=' + this.props.navigation.state.params.id;

        console.log(url);

        try {
            let response = await fetch(url);
            var result = await response.json();
        } catch (error) {
            this.setState({ refreshing: false });
            ToastAndroid.show('网络错误', ToastAndroid.SHORT);
            return;
        }

        if (result.status == 1) {
            this.loadedFans = true;
            this.setState({ refreshing: false, fansDataSource: this.ds.cloneWithRows(result.list) });
        }
        if (result.status == -1) {
            ToastAndroid.show(result.msg, ToastAndroid.SHORT);
            this.setState({ refreshing: false });
        }
    }

    _renderDynamicRow(rowData, sectionID, rowID) {
        return <DynamicRow
            rowData={rowData}
            user={this.user}
            rowID={rowID}
            navigation={this.props.navigation}
            onPressLike={(dynamic_id, rowId) => {
                this.dynamicId = dynamic_id;
                this.rowId = rowId;
                this._onPressLike();
            }}
            callback={(wasReplyNickname, dynamic_id, parent_id, rowId) => {
                let dynamic = this.state.dynamic;
                dynamic.dynamic_id = dynamic_id;
                dynamic.parent_id = parent_id;

                this.dynamicId = dynamic_id;
                this.rowId = rowId;
                this.setState({ dynamic: dynamic, wasReplyNickname: wasReplyNickname, visible: !this.state.visible });
            }} />
    }

    _renderDynamics() {
        return (
            <ListView
                refreshControl={
                    <RefreshControl enabled={true} refreshing={this.state.refreshing} onRefresh={() => this._onRefreshDynamics()} progressBackgroundColor='#eee' colors={['#ffaa66cc', '#ff00ddff']} />
                }
                showsVerticalScrollIndicator={true}
                showsHorizontalScrollIndicator={false}
                enableEmptySections={true}
                renderFooter={() => <LoadMore2 loadMoreFlag={this.state.dynamicObject.loadMoreFlag} bgcolor='#fff' />}
                dataSource={this.state.dynamicObject.dataSource}
                onEndReached={() => {
                    if (this.state.refreshing == false && this.state.dynamicObject.loadMoreFlag == 0 && this.dynamicObject.isPageEnd == false) {
                        let dynamicObject = this.state.dynamicObject;
                        dynamicObject.loadMoreFlag = 1;
                        this.setState({ dynamicObject: dynamicObject });
                        this._fetchDynamics();
                    }
                }}
                renderRow={this._renderDynamicRow.bind(this)}
                renderHeader={() => {
                    if (this.state.refreshing == false && this.state.dynamicObject.dataSource.getRowCount() == 0 && this.dynamicObject.isPageEnd == true) {
                        return (
                            <View style={{ alignItems: 'center', justifyContent: 'center', flex: 1, height: Dimensions.get('window').height }}>
                                <Text style={{ fontSize: 16, color: '#ccc' }}>TA还没有发表动态哦</Text>
                            </View>
                        );
                    }
                }}
            />
        );
    }

    _renderPosts() {
        return (
            <ListView
                refreshControl={
                    <RefreshControl enabled={true} refreshing={this.state.refreshing} onRefresh={() => this._onRefreshPosts()} progressBackgroundColor='#eee' colors={['#ffaa66cc', '#ff00ddff']} />
                }
                showsVerticalScrollIndicator={true}
                showsHorizontalScrollIndicator={false}
                enableEmptySections={true}
                renderFooter={() => <LoadMore2 loadMoreFlag={this.state.postsObject.loadMoreFlag} bgcolor='#fff' />}
                dataSource={this.state.postsObject.dataSource}
                onEndReached={() => {
                    if (this.state.refreshing == false && this.state.postsObject.loadMoreFlag == 0 && this.postsObject.isPageEnd == false) {
                        let postsObject = this.state.postsObject;
                        postsObject.loadMoreFlag = 1;
                        this.setState({ postsObject: postsObject });
                        this._fetchPosts();
                    }
                }}
                renderRow={this._renderPostsRow.bind(this)}
                renderHeader={() => {
                    if (this.state.refreshing == false && this.state.postsObject.dataSource.getRowCount() == 0 && this.postsObject.isPageEnd == true) {
                        return (
                            <View style={{ alignItems: 'center', justifyContent: 'center', flex: 1, height: Dimensions.get('window').height }}>
                                <Text style={{ fontSize: 16, color: '#ccc' }}>TA还没有发布帖子哦</Text>
                            </View>
                        );
                    }
                }}
            />
        );
    }

    _renderPostsRow(rowData) {
        return <IndexPostsRow navigation={this.props.navigation} rowData={rowData} />;
    }

    _renderFocus() {
        return (
            <ListView
                refreshControl={
                    <RefreshControl enabled={true} refreshing={this.state.refreshing} onRefresh={() => this._fetchFocus()} progressBackgroundColor='#eee' colors={['#ffaa66cc', '#ff00ddff']} />
                }
                showsVerticalScrollIndicator={true}
                showsHorizontalScrollIndicator={false}
                enableEmptySections={true}
                dataSource={this.state.focusDataSource}
                onEndReached={() => { }}
                renderRow={this._renderFocusRow.bind(this)}
                renderHeader={() => {
                    if (this.state.refreshing == false && this.state.focusDataSource.getRowCount() == 0 && this.LoadedFocus == true) {
                        return (
                            <View style={{ alignItems: 'center', justifyContent: 'center', flex: 1, height: Dimensions.get('window').height }}>
                                <Text style={{ fontSize: 16, color: '#ccc' }}>TA还没有关注其他人哦</Text>
                            </View>
                        );
                    }
                }}
            />
        );
    }

    _renderFocusRow(rowData) {

        let user_id = 0;

        if (this.state.currTabel == 2) {
            user_id = rowData.to_id;
        }
        if (this.state.currTabel == 3) {
            user_id = rowData.from_id;
        }

        return (
            <TouchableHighlight underlayColor="rgba(0,0,0,0.1)" onPress={() => { this.props.navigation.navigate('User', { id: user_id }) }}>
                <View style={{
                    paddingHorizontal: 10,
                    paddingVertical: 13,
                    flex: 1,
                    flexDirection: 'row',
                    alignItems: 'center',
                    backgroundColor: '#fff',
                    borderBottomWidth: StyleSheet.hairlineWidth,
                    borderColor: '#eee'
                }}>
                    <DefaulImage style={{ height: 50, width: 50, borderRadius: 25 }} source={{ uri: rowData.avator }} />
                    <Text style={{ flex: 1, color: '#222', marginLeft: 10 }}>{rowData.nickname}</Text>
                    <Icon name="ios-arrow-forward-outline" size={20} color="#eee" />
                </View>
            </TouchableHighlight>
        );
    }

    _renderFans() {
        return (
            <ListView
                refreshControl={
                    <RefreshControl enabled={true} refreshing={this.state.refreshing} onRefresh={() => this._fetchFans()} progressBackgroundColor='#eee' colors={['#ffaa66cc', '#ff00ddff']} />
                }
                showsVerticalScrollIndicator={true}
                showsHorizontalScrollIndicator={false}
                enableEmptySections={true}
                dataSource={this.state.fansDataSource}
                onEndReached={() => { }}
                renderRow={this._renderFocusRow.bind(this)}
                renderHeader={() => {
                    if (this.state.refreshing == false && this.state.fansDataSource.getRowCount() == 0 && this.loadedFans == true) {
                        return (
                            <View style={{ alignItems: 'center', justifyContent: 'center', flex: 1, height: Dimensions.get('window').height }}>
                                <Text style={{ fontSize: 16, color: '#ccc' }}>TA还没有粉丝哦</Text>
                            </View>
                        );
                    }
                }}
            />
        );
    }

    _onPressTabel(currTabel) {

        this._viewPage.setPage(currTabel);

        this.setState({ currTabel: currTabel });

        if (currTabel == 0 && this.dynamicObject.list.length == 0 && this.dynamicObject.isPageEnd == false) {
            this._onRefreshDynamics();
        }

        if (currTabel == 1 && this.postsObject.list.length == 0 && this.postsObject.isPageEnd == false) {
            this._onRefreshPosts();
        }

        if (currTabel == 2 && this.state.focusDataSource.getRowCount() == 0 && this.LoadedFocus == false) {
            this._fetchFocus();
        }

        if (currTabel == 3 && this.state.fansDataSource.getRowCount() == 0 && this.loadedFans == false) {
            this._fetchFans();
        }
    }

    _onPageSelected = (e) => {
        this._onPressTabel(e.nativeEvent.position);
    }

    render() {

        let body = (
            <View style={{ flex: 1, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' }}>
                <ActivityIndicator animating={true} size="large" color="#03c893" />
            </View>
        );

        if (this.state.data != null) {
            body = (
                <View style={{ flex: 1 }}>
                    {/*头部信息*/}
                    <View style={{ backgroundColor: '#03c893' }}>
                        <View
                            style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 12, paddingBottom: 12, borderBottomWidth: StyleSheet.hairlineWidth, borderColor: '#ddd' }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <DefaulImage source={{ uri: this.state.data.avator }} style={{ width: 44, height: 44 }} />
                                <Text style={{ marginLeft: 15, color: '#fff' }}>{this.state.data.nickname}</Text>
                            </View>
                            <TouchableHighlight
                                underlayColor="rgba(0,0,0,0.1)"
                                onPress={() => { this._focus() }}
                                style={{ borderWidth: 1, borderColor: '#fff', borderRadius: 3, height: 20, paddingHorizontal: 4, justifyContent: 'center' }}
                            >
                                <Text style={{ fontSize: 12, color: '#fff' }}>{this.state.data.is_focus == 1 ? '取消关注' : '添加关注'}</Text>
                            </TouchableHighlight>
                        </View>
                        <View style={{ height: 40 }}>
                            <View style={{ flex: 1, flexDirection: 'row', paddingVertical: 10 }}>
                                <TouchableHighlight
                                    style={{ flex: 1, alignItems: 'center', justifyContent: 'center', borderRightWidth: StyleSheet.hairlineWidth, borderRightColor: '#ddd' }}
                                    underlayColor='rgba(0,0,0,0)' onPress={() => { this._onPressTabel(0) }}>
                                    <Text style={{ color: this.state.currTabel == 0 ? '#fff' : '#ddd', fontSize: 14 }}>动态 {this.state.data.dynamic_account}</Text>
                                </TouchableHighlight>
                                <TouchableHighlight
                                    style={{ flex: 1, alignItems: 'center', justifyContent: 'center', borderRightWidth: StyleSheet.hairlineWidth, borderRightColor: '#ddd' }}
                                    underlayColor='rgba(0,0,0,0)' onPress={() => { this._onPressTabel(1) }}>
                                    <Text style={{ color: this.state.currTabel == 1 ? '#fff' : '#ddd', fontSize: 14 }}>帖子 {this.state.data.posts_account}</Text>
                                </TouchableHighlight>
                                <TouchableHighlight
                                    style={{ flex: 1, alignItems: 'center', justifyContent: 'center', borderRightWidth: StyleSheet.hairlineWidth, borderRightColor: '#ddd' }}
                                    underlayColor='rgba(0,0,0,0)'
                                    onPress={() => { this._onPressTabel(2) }}>
                                    <Text style={{ color: this.state.currTabel == 2 ? '#fff' : '#ddd', fontSize: 14 }}>关注 {this.state.data.focus_account}</Text>
                                </TouchableHighlight>
                                <TouchableHighlight
                                    style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}
                                    underlayColor='rgba(0,0,0,0)'
                                    onPress={() => { this._onPressTabel(3) }}>
                                    <Text style={{ color: this.state.currTabel == 3 ? '#fff' : '#ddd', fontSize: 14 }}>粉丝 {this.state.data.fans_account}</Text>
                                </TouchableHighlight>
                            </View>
                        </View>
                    </View>
                    {/*\头部信息*/}
                    <View style={{ flex: 1, backgroundColor: '#fff' }}>
                        <ViewPagerAndroid
                            ref={viewPager => { this._viewPage = viewPager; }} style={{ width: ScreenW, flex: 1 }} initialPage={0} onPageSelected={this._onPageSelected}>
                            {/*动态列表*/}
                            <View style={{ width: ScreenW, flex: 1 }}>
                                {this._renderDynamics()}
                            </View>
                            {/*\动态列表*/}
                            {/*帖子列表*/}
                            <View style={{ width: ScreenW, flex: 1 }}>
                                {this._renderPosts()}
                            </View>
                            {/*\帖子列表*/}
                            {/*关注列表*/}
                            <View style={{ width: ScreenW, flex: 1 }}>
                                {this._renderFocus()}
                            </View>
                            {/*\关注列表*/}
                            {/*粉丝列表*/}
                            <View style={{ width: ScreenW, flex: 1 }}>
                                {this._renderFans()}
                            </View>
                            {/*\粉丝列表*/}
                        </ViewPagerAndroid >
                    </View>
                </View>
            );
        }

        return (
            <View style={{ flex: 1 }}>
                {/* 设置状态栏颜色 */}
                <StatusBar backgroundColor="#03c893" />
                {/* 顶部导航栏 */}
                <View style={{ flexDirection: 'row', height: 45, paddingHorizontal: 10, alignItems: 'center', backgroundColor: '#03c893', }}>
                    <TouchableHighlight underlayColor="rgba(0,0,0,0)" onPress={() => { this.props.navigation.goBack(null); }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <Icon name="ios-arrow-back-outline" size={22} color="#fff" style={{ marginTop: 1 }} />
                            <Text style={{ color: '#fff', fontSize: 14, marginLeft: 7 }}>用户中心</Text>
                        </View>
                    </TouchableHighlight>
                </View>
                {body}
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