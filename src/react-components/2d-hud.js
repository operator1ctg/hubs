import React, { Component } from "react";
import PropTypes from "prop-types";
import cx from "classnames";

const { detect } = require("detect-browser");
import styles from "../assets/stylesheets/2d-hud.scss";
import uiStyles from "../assets/stylesheets/ui-root.scss";
import { WithHoverSound } from "./wrap-with-audio";
import { FormattedMessage } from "react-intl";

const browser = detect();

class TopHUD extends Component {
  static propTypes = {
    muted: PropTypes.bool,
    frozen: PropTypes.bool,
    videoShareMediaSource: PropTypes.string,
    activeTip: PropTypes.string,
    history: PropTypes.object,
    onToggleMute: PropTypes.func,
    onToggleFreeze: PropTypes.func,
    onSpawnPen: PropTypes.func,
    onSpawnCamera: PropTypes.func,
    onShareVideo: PropTypes.func,
    onEndShareVideo: PropTypes.func,
    onShareVideoNotCapable: PropTypes.func,
    mediaSearchStore: PropTypes.object
  };

  state = {
    showVideoShareOptions: false,
    lastActiveMediaSource: null
  };

  handleVideoShareClicked = source => {
    if ((source === "screen" || source === "window") && browser.name !== "firefox") {
      this.props.onShareVideoNotCapable();
      return;
    }

    if (this.props.videoShareMediaSource) {
      this.props.onEndShareVideo();
    } else {
      this.props.onShareVideo(source);
      this.setState({ lastActiveMediaSource: source });
    }
  };

  buildVideoSharingButtons = () => {
    const isMobile = AFRAME.utils.device.isMobile() || AFRAME.utils.device.isMobileVR();

    const videoShareExtraOptionTypes = [];
    const primaryVideoShareType =
      this.props.videoShareMediaSource || this.state.lastActiveMediaSource || (isMobile ? "camera" : "screen");

    if (this.state.showVideoShareOptions) {
      videoShareExtraOptionTypes.push(primaryVideoShareType);

      ["screen", "window", "camera"].forEach(t => {
        if (videoShareExtraOptionTypes.indexOf(t) === -1) {
          videoShareExtraOptionTypes.push(t);
        }
      });
    }

    const showExtrasOnHover = () => {
      if (isMobile) return;

      clearTimeout(this.hideVideoSharingButtonTimeout);

      if (!this.props.videoShareMediaSource) {
        this.setState({ showVideoShareOptions: true });
      }
    };

    const hideExtrasOnOut = () => {
      this.hideVideoSharingButtonTimeout = setTimeout(() => {
        this.setState({ showVideoShareOptions: false });
      }, 250);
    };

    return (
      <WithHoverSound>
        <div
          className={cx(styles.iconButton, styles[`share_${primaryVideoShareType}`], {
            [styles.active]: this.props.videoShareMediaSource === primaryVideoShareType,
            [styles.videoShare]: true
          })}
          title={this.props.videoShareMediaSource !== null ? "Stop sharing" : `Share ${primaryVideoShareType}`}
          onClick={() => {
            if (!this.state.showVideoShareOptions) {
              this.handleVideoShareClicked(primaryVideoShareType);
            }
          }}
          onMouseOver={showExtrasOnHover}
        >
          {videoShareExtraOptionTypes.length > 0 && (
            <div className={cx(styles.videoShareExtraOptions)} onMouseOut={hideExtrasOnOut}>
              {videoShareExtraOptionTypes.map(type => (
                <WithHoverSound key={type}>
                  <div
                    key={type}
                    className={cx(styles.iconButton, styles[`share_${type}`], {
                      [styles.active]: this.props.videoShareMediaSource === type
                    })}
                    title={this.props.videoShareMediaSource === type ? "Stop sharing" : `Share ${type}`}
                    onClick={() => this.handleVideoShareClicked(type)}
                    onMouseOver={showExtrasOnHover}
                  />
                </WithHoverSound>
              ))}
            </div>
          )}
        </div>
      </WithHoverSound>
    );
  };

  render() {
    const videoSharingButtons = this.buildVideoSharingButtons();

    return (
      <div className={cx(styles.container, styles.top, styles.unselectable, uiStyles.uiInteractive)}>
        <div className={cx(uiStyles.uiInteractive, styles.panel)}>
          {this.props.activeTip && (
            <div className={cx(styles.topTip)}>
              <div className={cx([styles.attachPoint, styles[`attach_${this.props.activeTip.split(".")[1]}`]])} />
              <FormattedMessage id={`tips.${this.props.activeTip}`} />
            </div>
          )}
          {videoSharingButtons}
          <WithHoverSound>
            <div
              className={cx(styles.iconButton, styles.mute, { [styles.active]: this.props.muted })}
              title={this.props.muted ? "Unmute Mic" : "Mute Mic"}
              onClick={this.props.onToggleMute}
            />
          </WithHoverSound>
          <button
            className={cx(uiStyles.uiInteractive, styles.iconButton, styles.spawn)}
            onClick={() => this.props.mediaSearchStore.sourceNavigateToDefaultSource()}
          />
          <WithHoverSound>
            <div
              className={cx(styles.iconButton, styles.spawn_pen)}
              title={"Drawing Pen"}
              onClick={this.props.onSpawnPen}
            />
          </WithHoverSound>
          <WithHoverSound>
            <div
              className={cx(styles.iconButton, styles.spawn_camera)}
              title={"Camera"}
              onClick={this.props.onSpawnCamera}
            />
          </WithHoverSound>
        </div>
      </div>
    );
  }
}

export default { TopHUD };
