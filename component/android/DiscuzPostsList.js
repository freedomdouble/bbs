'use strict';

import React, { Component } from 'react';
import {
    View,
    Text,
    BackAndroid,
    StatusBar,
    ListView,
    ActivityIndicator,
    ToastAndroid,
    StyleSheet,
    TouchableHighlight,
    Modal,
    Image,
    AsyncStorage
} from 'react-native';

import Icon from 'react-native-vector-icons/Ionicons';
import LoadMore2 from './LoadMore2';
import DiscuzPostsRow from './DiscuzPostsRow';

export default class DiscuzPostsList extends Component {

    constructor(props) {

        super(props);
        this.user = null;
        this.ds = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 });
        this.page = 1;
        this.order = 'comment';
        this.tag_id = 0;
        this.tag_name = '全部分类';
        this.isPageEnd = false;
        this.dataSource = [];
        this.state = { dataSource: this.ds.cloneWithRows([]), loadMoreFlag: 0, modalVisible: false, modalTagsVisible: false, cate: null, tags: [] };
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

        this._fetchPostsesData();
        this._fetchCateData();
        this._fetchTagsData();
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


    /**
     * 获取分类详情
     */
    async _fetchCateData() {

        let url = 'http://121.11.71.33:8081/api/posts/cate?id=' + this.props.navigation.state.params.id;

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
            this.setState({ cate: result.data });
        }
    }

    /**
     * 获取分类下的标签列表
     */
    async _fetchTagsData() {

        let url = 'http://121.11.71.33:8081/api/posts/tags?id=' + this.props.navigation.state.params.id;

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
            let _tag = result.list;
            _tag.unshift({ id: 0, tag_name: '全部分类' });
            this.setState({ tags: _tag });
        }
    }

    /**
     * 获取帖子列表
     */
    async _fetchPostsesData() {

        let url = 'http://121.11.71.33:8081/api/posts/list?order=' + this.order + '&page=' + this.page + '&cate_id=' + this.props.navigation.state.params.id + '&tag_id=' + this.tag_id;

        try {
            let response = await fetch(url);
            var result = await response.json();
        } catch (error) {
            this.isPageEnd = true;
            ToastAndroid.show('网络错误', ToastAndroid.SHORT);
            return;
        }

        if (result.status == -1) {
            this.isPageEnd = true;
            ToastAndroid.show(result.msg, ToastAndroid.SHORT);
            return;
        }

        if (result.status == 1) {

            if (result.list.length == 0) {
                this.isPageEnd = true;
                ToastAndroid.show('没有数据', ToastAndroid.SHORT);
                return;
            }

            for (var i = 0; i < result.list.length; i++) {
                this.dataSource.push(result.list[i]);
            }

            if (result.list.length < 10) {
                this.isPageEnd = true;
                this.setState({ loadMoreFlag: 2, dataSource: this.ds.cloneWithRows(this.dataSource) });
            }

            if (result.list.length == 10) {
                this.page += 1;
                this.setState({ loadMoreFlag: 0, dataSource: this.ds.cloneWithRows(this.dataSource) });
            }
        }
    }

    /**
     * 重新获取数据
     */
    async _onPressReset() {

        ToastAndroid.show('正在加载...', ToastAndroid.SHORT);

        let url = 'http://121.11.71.33:8081/api/posts/list?order=' + this.order + '&page=1&cate_id=' + this.props.navigation.state.params.id + '&tag_id=' + this.tag_id;

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

            this.page = 1;
            this.isPageEnd = false;

            if (result.list.length == 0) {
                this.isPageEnd = true;
                ToastAndroid.show('没有数据', ToastAndroid.SHORT);
                return;
            }

            this.dataSource = [];

            for (var i = 0; i < result.list.length; i++) {
                this.dataSource.push(result.list[i]);
            }

            if (result.list.length < 10) {
                this.isPageEnd = true;
                this.setState({ loadMoreFlag: 2, dataSource: this.ds.cloneWithRows(this.dataSource) });
            }

            if (result.list.length == 10) {
                this.page += 1;
                this.setState({ loadMoreFlag: 0, dataSource: this.ds.cloneWithRows(this.dataSource) });
            }
        }
    }

    _renderHeader() {
        return (
            <View>
                <View style={{
                    flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', paddingHorizontal: 12,
                    paddingVertical: 20, marginBottom: 30, justifyContent: 'space-between'
                }}>
                    <View style={{ flexDirection: 'row' }}>
                        <Image source={{ uri: this.state.cate.thumb }} style={{ width: 50, height: 50, borderRadius: 8 }} />
                        <View style={{ justifyContent: 'space-between', marginLeft: 8 }}>
                            <Text style={{ fontSize: 14, color: '#222' }}>{this.state.cate.title}</Text>
                            <Text style={{ fontSize: 12, color: '#ccc' }}>主题：{this.state.cate.count}</Text>
                        </View>
                    </View>
                    {/*分类按钮*/}
                    <TouchableHighlight underlayColor="rgba(0,0,0,0.1)" onPress={() => this.setState({ modalTagsVisible: !this.state.modalTagsVisible })}>
                        <View style={{ flexDirection: 'row', borderColor: '#03c893', borderWidth: 1, paddingHorizontal: 8, paddingVertical: 1, borderRadius: 4 }}>
                            <Text style={{ color: '#03c893', fontSize: 12 }}>{this.tag_name}</Text>
                        </View>
                    </TouchableHighlight>
                    {/*\分类按钮*/}
                </View>
                {/*排序按钮*/}
                <TouchableHighlight underlayColor="rgba(0,0,0,0.1)" onPress={() => this.setState({ modalVisible: !this.state.modalVisible })}>
                    <View style={{
                        flexDirection: 'row', backgroundColor: '#fff', paddingVertical: 12,
                        borderBottomWidth: StyleSheet.hairlineWidth, borderColor: '#ccc', alignItems: 'center', justifyContent: 'center'
                    }}>
                        <Text style={{ color: '#53ABFC', marginLeft: 1, fontSize: 12 }}>{this.order == 'new' ? '最新发布' : '最新回复'}</Text>
                        <Icon name="ios-arrow-down-outline" size={12} color="#53ABFC" style={{ marginTop: 2 }} />
                    </View>
                </TouchableHighlight>
                {/*\排序按钮*/}
            </View>
        );

    }

    _renderFooter() {

        return <LoadMore2 loadMoreFlag={this.state.loadMoreFlag} bgcolor='#fff' />;
    }

    _renderRow(rowData) {

        return (<DiscuzPostsRow navigation={this.props.navigation} rowData={rowData} />);
    }

    // 选择排序模态框
    _renderSortModal() {
        return (
            <Modal transparent={true} visible={this.state.modalVisible} onRequestClose={() => this.setState({ modalVisible: false })}>
                <StatusBar backgroundColor="#000" />
                <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.7)' }}>
                    <View style={{ backgroundColor: '#fff' }}>
                        <TouchableHighlight
                            underlayColor="rgba(0,0,0,0.1)"
                            style={{ paddingVertical: 14, borderBottomWidth: StyleSheet.hairlineWidth, borderColor: '#eee', alignItems: 'center' }}
                            onPress={() => { this.setState({ modalVisible: !this.state.modalVisible }); this.order = 'comment'; this._onPressReset() }}
                        >
                            <Text>最新回复</Text>
                        </TouchableHighlight>
                        <TouchableHighlight
                            underlayColor="rgba(0,0,0,0.1)"
                            style={{ paddingVertical: 14, alignItems: 'center' }}
                            onPress={() => { this.setState({ modalVisible: !this.state.modalVisible }); this.order = 'new'; this._onPressReset() }}
                        >
                            <Text>最新发布</Text>
                        </TouchableHighlight>
                        <View style={{ height: 15, backgroundColor: '#eee' }} />
                        <TouchableHighlight
                            underlayColor="rgba(0,0,0,0.1)"
                            style={{ paddingVertical: 14, alignItems: 'center' }}
                            onPress={() => this.setState({ modalVisible: !this.state.modalVisible })}
                        >
                            <Text>取消排序</Text>
                        </TouchableHighlight>
                    </View>
                </View>
            </Modal>
        );
    }

    // 选择标签模态框
    _renderTagsModal() {

        let tagsWraper = [];

        this.state.tags.forEach((tag, i) => {
            tagsWraper.push(
                <TouchableHighlight
                    key={i}
                    underlayColor="rgba(0,0,0,0.1)"
                    style={{ paddingVertical: 14, borderBottomWidth: StyleSheet.hairlineWidth, borderColor: '#eee', alignItems: 'center' }}
                    onPress={() => { this.setState({ modalTagsVisible: !this.state.modalTagsVisible }); this.tag_id = tag.id; this.tag_name = tag.tag_name; this._onPressReset() }}
                >
                    <Text>{tag.tag_name}</Text>
                </TouchableHighlight>
            );
        });

        return (
            <Modal transparent={true} visible={this.state.modalTagsVisible} onRequestClose={() => this.setState({ modalTagsVisible: false })}>
                <StatusBar backgroundColor="#000" />
                <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.7)' }}>
                    <View style={{ backgroundColor: '#fff' }}>
                        {tagsWraper}
                        <View style={{ height: 15, backgroundColor: '#eee' }} />
                        <TouchableHighlight
                            underlayColor="rgba(0,0,0,0.1)"
                            style={{ paddingVertical: 14, alignItems: 'center' }}
                            onPress={() => this.setState({ modalTagsVisible: !this.state.modalTagsVisible })}
                        >
                            <Text>取消选择</Text>
                        </TouchableHighlight>
                    </View>
                </View>
            </Modal>
        );
    }

    render() {

        let _body = (
            <View style={{ flex: 1, backgroundColor: '#f4f4f4', alignItems: 'center', justifyContent: 'center' }}>
                <ActivityIndicator animating={true} size="large" color="#03c893" />
            </View>
        );

        if (this.dataSource.length > 0 && this.state.cate != null && this.state.tags.length > 0) {
            _body = (
                <View style={{ flex: 1, backgroundColor: '#f4f4f4' }}>
                    <ListView
                        showsVerticalScrollIndicator={true}
                        showsHorizontalScrollIndicator={false}
                        enableEmptySections={true}
                        renderHeader={() => this._renderHeader()}
                        renderFooter={() => this._renderFooter()}
                        dataSource={this.state.dataSource}
                        onEndReached={() => {
                            if (this.state.loadMoreFlag == 0 && this.isPageEnd == false) {
                                this.setState({ loadMoreFlag: 1 });
                                this._fetchPostsesData();
                            }
                        }}
                        renderRow={this._renderRow.bind(this)}
                    />
                </View>
            );
        }

        return (
            <View style={{ flex: 1 }}>
                {/* 头部 */}
                <View>
                    {/* 状态栏 */}
                    <StatusBar backgroundColor="#03c893" barStyle="light-content" />
                    {/* 工具栏 */}
                    <View style={{ flexDirection: 'row', height: 45, paddingHorizontal: 12, alignItems: 'center', backgroundColor: '#03c893', justifyContent: 'space-between' }}>
                        <TouchableHighlight underlayColor="rgba(0,0,0,0)" onPress={() => { this.props.navigation.goBack(null) }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', }}>
                                <Icon name="ios-arrow-back-outline" size={22} color="#fff" style={{ marginTop: 1 }} />
                                <Text style={{ color: '#fff', fontSize: 16, marginLeft: 7 }}>返回</Text>
                            </View>
                        </TouchableHighlight>
                        <TouchableHighlight underlayColor="rgba(0,0,0,0)" onPress={() => {
                            if (this.user == null) {
                                this.props.navigation.navigate('Login');
                                return;
                            }
                            this.props.navigation.navigate('PostsPublish');
                        }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', }}>
                                <Icon name="ios-create-outline" size={30} color="#fff" />
                            </View>
                        </TouchableHighlight>
                    </View>
                </View>
                {/* 主体内容 */}
                {_body}
                {/*排序选择模态框*/}
                {this._renderSortModal()}
                {/*标签选择模态框*/}
                {this._renderTagsModal()}
            </View>
        );
    }
}