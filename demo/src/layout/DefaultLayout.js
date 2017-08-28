import React, { Component } from "react"
import ReactDOM from "react-dom"
import { Icon } from "antd"
import Layout from "./Layout"
import { connect } from "react-redux"
import { withRouter, Route } from "react-router-dom"
import dottie from "dottie"
//import ContactItem from "@/components/contact/ContactItem"
import ChatRoomActions from "@/redux/ChatRoomRedux"
import Contact from "@/containers/contact/Contact"
import Chat from "@/containers/chat/Chat"
import HeaderTab from "@/components/header/HeaderTab"
import HeaderOps from "@/components/header/HeaderOps"
import GroupActions from "@/redux/GroupRedux"
import GroupMemberActions from "@/redux/GroupMemberRedux"
import { config } from "@/config"
import utils from "@/utils"

const { SIDER_COL_BREAK, SIDER_COL_WIDTH, SIDER_WIDTH, RIGHT_SIDER_WIDTH } = config
const { Header, Content, Footer, Sider, RightSider } = Layout

class DefaultLayout extends Component {
    constructor({ breakpoint, match }) {
        super()
        const { selectTab, selectItem = "" } = match.params

        this.state = {
            collapsed: breakpoint[SIDER_COL_BREAK],
            selectTab: selectTab,
            selectItem: selectItem,
            headerTabs: [
                {
                    key: "contact",
                    name: "Contact",
                    icon: "fontello icon-comment"
                },
                {
                    key: "group",
                    name: "Group",
                    icon: "fontello icon-chat"
                },
                {
                    key: "chatroom",
                    name: "ChatRoom",
                    icon: "fontello icon-users-1"
                },
                {
                    key: "stranger",
                    name: "Stranger",
                    icon: "fontello icon-address-book-1"
                }
            ],
            rightSiderOffset: -1 * RIGHT_SIDER_WIDTH,
            roomId: NaN,
            room: {},
            contactItems: []
        }

        this.changeItem = this.changeItem.bind(this)
        this.changeTab = this.changeTab.bind(this)
        this.handleCloseRightSiderClick = this.handleCloseRightSiderClick.bind(this)
    }

    toggle = collapsed => {
        // console.log("collapsed", collapsed)
        this.setState({
            collapsed
        })
    }

    // 切换聊天类型
    changeTab(e) {
        const { history, location } = this.props
        const { selectItem, selectTab } = this.state
        const redirectPath = "/" + [e.key].join("/")
        if (selectTab == e.key) return
        history.push(redirectPath + location.search)
    }

    // 切换联系人
    changeItem(e) {
        console.log("changeItem", e)
        const { history, location, entities } = this.props
        const { selectItem, selectTab } = this.state
        const redirectPath = "/" + [selectTab, e.key].join("/")
        if (selectItem == e.key) return

        // if (selectItem !== e.key && selectTab === 'group') {

        if (selectTab === "group") {
            const id = selectItem
            if (id) {
                this.setState({ roomId: id })
                const room = dottie.get(entities, `group.byId.${id}`, {})
                this.setState({ room })
                this.props.getGroupMember(id)
            }
        }

        if (selectTab == "chatroom") {
            //quit previous chatroom
            if (selectItem) {
                this.props.quitChatRoom(selectItem)
            }

            // join chatroom
            this.props.joinChatRoom(e.key)
        }

        history.push(redirectPath + location.search)
    }

    setSelectStatus() {
        const { history, location, match } = this.props
        const { selectTab, selectItem = "" } = match.params
        // console.log(match)
        this.setState({
            selectTab,
            selectItem
        })
    }

    handleCloseRightSiderClick(e) {
        e.preventDefault()
        console.log(e.target)
        this.props.switchRightSider({ rightSiderOffset: 0 })
    }

    componentDidMount() {
        // this.setSelectStatus()
    }

    componentWillReceiveProps(nextProps) {
        // console.log(
        //     "componentWillReceiveProps",
        //     this.props.location.pathname,
        //     nextProps.location.pathname
        // )
        const { breakpoint, location } = this.props
        const nextBeakpoint = nextProps.breakpoint

        // if (breakpoint[SIDER_COL_BREAK] != nextBeakpoint[SIDER_COL_BREAK]) {
        // console.log(breakpoint, "---1")

        this.toggle(nextBeakpoint[SIDER_COL_BREAK])
        // }

        if (location.pathname != nextProps.location.pathname) {
            this.props = nextProps
            // console.log("componentWillReceiveProps", location)
            this.setSelectStatus()
        }
    }

    render() {
        const { collapsed, selectTab, selectItem, headerTabs, roomId } = this.state
        const { login, entities: { group: { rightSiderOffset } } } = this.props
        return (
            <Layout>
                <Header className="header">
                    <HeaderOps title={login.username} />
                    <HeaderTab
                        collapsed={collapsed}
                        items={headerTabs}
                        selectedKeys={[selectTab]}
                        onClick={this.changeTab}
                    />
                </Header>
                <Content className="x-layout-main">
                    <div
                        className="x-layout-sider"
                        style={{
                            // sider full display when breakpoint
                            width: collapsed ? "100%" : SIDER_WIDTH,
                            // sider display to left when breakpoint and has selectItem
                            left: selectItem && collapsed ? "-100%" : 0
                        }}
                    >
                        <Contact collapsed={false} onClick={this.changeItem} selectedKeys={[selectItem]} />
                    </div>
                    <Content
                        className="x-layout-chat"
                        style={{
                            overflow: "scroll",
                            margin: collapsed ? `0` : `0 0 0 ${SIDER_WIDTH}px`
                        }}
                    >
                        <Route
                            path="/:selectTab/:selectItem"
                            render={props => <Chat collapsed={collapsed} {...props} />}
                        />
                    </Content>
                    <div
                        className="x-layout-right-sider"
                        style={{ width: `${RIGHT_SIDER_WIDTH}px`, marginLeft: `${rightSiderOffset}px` }}
                    >
                        <RightSider roomId={roomId} room={this.state.room} ref="rightSider" />
                    </div>
                    {/*<Footer style={{ textAlign: "center" }}>
                     Ant Design ©2016 Created by Ant UED
                     </Footer>*/}
                </Content>
            </Layout>
        )
    }
}

export default withRouter(
    connect(
        ({ breakpoint, entities, login }) => ({
            breakpoint,
            entities,
            login
        }),
        dispatch => ({
            getGroupMember: id => dispatch(GroupMemberActions.getGroupMember(id)),
            switchRightSider: ({ rightSiderOffset }) => dispatch(GroupActions.switchRightSider({ rightSiderOffset })),
            joinChatRoom: roomId => dispatch(ChatRoomActions.joinChatRoom(roomId)),
            quitChatRoom: roomId => dispatch(ChatRoomActions.quitChatRoom(roomId))
        })
    )(DefaultLayout)
)
