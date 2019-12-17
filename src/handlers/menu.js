'use strict';

const { remote, shell, ipcRenderer } = require('electron');
const AppConfig = require('../configuration');

const { Menu, app } = remote;

const lan = AppConfig.readSettings('language');
let Common;
if (lan === 'zh-CN') {
  Common = require('../common_cn');
} else {
  Common = require('../common');
}

class MenuHandler {
  create() {
    const template = this.getTemplate(remote.process.platform);
    if (template) {
      const menuFromTemplate = Menu.buildFromTemplate(template);
      Menu.setApplicationMenu(menuFromTemplate);
    }
  }

  getTemplate(platform) {
    const darwinTemplate = [
      {
        label: Common.ELECTRONIC_WECHAT,
        submenu: [
          {
            label: Common.MENU.about,
            selector: 'orderFrontStandardAboutPanel:',
          },
          {
            type: 'separator',
          },
          {
            label: Common.MENU.service,
            submenu: [],
          },
          {
            type: 'separator',
          },
          {
            label: Common.MENU.hide,
            accelerator: 'Command+H',
            selector: 'hide:',
          },
          {
            label: Common.MENU.hideOther,
            accelerator: 'Command+Alt+H',
            selector: 'hideOtherApplications:',
          },
          {
            label: Common.MENU.showAll,
            selector: 'unhideAllApplications:',
          },
          {
            type: 'separator',
          },
          {
            label: Common.MENU.pref,
            click: MenuHandler._preference,
          },
          {
            type: 'separator',
          },
          {
            label: Common.MENU.quit,
            accelerator: 'Command+Q',
            click: MenuHandler._quitApp,
          },
        ],
      },
      {
        label: Common.MENU.edit,
        submenu: [
          {
            label: Common.MENU.undo,
            accelerator: 'Command+Z',
            selector: 'undo:',
          },
          {
            label: Common.MENU.redo,
            accelerator: 'Shift+Command+Z',
            selector: 'redo:',
          },
          {
            type: 'separator',
          },
          {
            label: Common.MENU.cut,
            accelerator: 'Command+X',
            selector: 'cut:',
          },
          {
            label: Common.MENU.copy,
            accelerator: 'Command+C',
            selector: 'copy:',
          },
          {
            label: Common.MENU.paste,
            accelerator: 'Command+V',
            selector: 'paste:',
          },
          {
            label: Common.MENU.selectAll,
            accelerator: 'Command+A',
            selector: 'selectAll:',
          },
          {
            type: 'separator',
          },
          {
            label: Common.MENU.searchContacts,
            accelerator: 'Command+F',
            click: () => {
              $('#search_bar input')[0].focus();
            },
          },
        ],
      },
      {
        label: Common.MENU.view,
        submenu: [
          {
            label: Common.MENU.reload,
            accelerator: 'Command+R',
            click: MenuHandler._reload,
          },
          {
            label: Common.MENU.devtool,
            accelerator: 'Alt+Command+I',
            click: MenuHandler._devTools,
          },
        ],
      },
      {
        label: Common.MENU.window,
        submenu: [
          {
            label: Common.MENU.min,
            accelerator: 'Command+M',
            selector: 'performMiniaturize:',
          },
          {
            label: Common.MENU.close,
            accelerator: 'Command+W',
            selector: 'performClose:',
          },
          {
            label: Common.MENU.toggleFullScreen,
            accelerator: 'Ctrl+Command+F',
            click: (item, focusedWindow) => {
              if (focusedWindow) {
                focusedWindow.setFullScreen(!focusedWindow.isFullScreen());
              }
            },
          },
          {
            type: 'separator',
          },
          {
            label: Common.MENU.allFront,
            selector: 'arrangeInFront:',
          },
        ],
      },
      {
        label: Common.MENU.help,
        submenu: [
          {
            label: Common.MENU.repo,
            click: MenuHandler._github,
          },
          {
            type: 'separator',
          }, {
            label: Common.MENU.feedback,
            click: MenuHandler._githubIssues,
          }, {
            label: Common.MENU.checkRelease,
            click: MenuHandler._update,
          }],
      },
    ];
	const linuxTemplate = [
	{
		label: Common.MENU.window,
		submenu: [
			{
				label: Common.MENU.pref,
				click: MenuHandler._preference,
			},
			{
				label: Common.MENU.reload,
				accelerator: 'Ctrl+R',
				click: MenuHandler._reload,
			},
			{
				label: Common.MENU.toggleFullScreen,
				accelerator: 'F11',
				click: (item, focusedWindow) => {
				if (focusedWindow) {
					focusedWindow.setFullScreen(!focusedWindow.isFullScreen());
				}
				},
			},
			{
				label: Common.MENU.devtool,
				accelerator: 'Ctrl+Shift+I',
				click: MenuHandler._devTools,
			},
			{
				type: 'separator',
			},
			{
				label: Common.MENU.searchContacts,
				accelerator: 'Ctrl+F',
				click: () => {
					$('#search_bar input')[0].focus();
				},
			},
			{
				label: Common.MENU.inputContents,
				accelerator: 'Ctrl+I',
				click: () => {
					$('#editArea').focus();
				}
			},
			{
				label: Common.MENU.toggleUsers,
				accelerator: 'Ctrl+Tab',
				click: MenuHandler._toggleUsers,
      },
      {
				label: Common.MENU.toggleUsers,
				accelerator: 'Ctrl+Shift+Tab',
				click: MenuHandler._reverseToggleUsers,
			},
			{
				label: Common.MENU.toggleFirstUser,
				accelerator: 'Ctrl+1',
				click: MenuHandler._toggleFirstUser,
			},
			{
				type: 'separator',
			},
			{
				label: Common.MENU.quit,
				accelerator: 'Ctrl+Q',
				click: MenuHandler._quitApp,
			},
		],
	},
	{
		label: Common.MENU.help,
		submenu: [
		{
			label: Common.MENU.repo,
			click: MenuHandler._github,
		},
		{
			type: 'separator',
		}, {
			label: Common.MENU.feedback,
			click: MenuHandler._githubIssues,
		}, {
			label: Common.MENU.checkRelease,
			click: MenuHandler._update,
		}],
	},
	];

		if (platform === 'darwin') {
			return darwinTemplate;
		} else if (platform === 'linux') {
			return linuxTemplate;
		}
	}

	static _quitApp() {
		app.exit(0);
	}

	static _reload() {
		ipcRenderer.send('reload');
	}

	static _devTools() {
		remote.getCurrentWindow().toggleDevTools();
	}

	static _github() {
		shell.openExternal(Common.GITHUB);
	}

	static _githubIssues() {
		shell.openExternal(Common.GITHUB_ISSUES);
	}

	static _update() {
		ipcRenderer.send('update');
	}

	static _preference() {
		ipcRenderer.send('open-settings-window');
	}

	static _toggleUsers() {
		let index = 0;
		let divs = $('#J_NavChatScrollBody > div').children();
		for(let i = 0; i < divs.length; ++i) {
			let tmp = divs[i].firstElementChild;
			if (tmp) {
				let className = tmp.className;
				if (className.includes("active")) {
					index = i;
					break;
				}
			}
		}

		let next = divs[index + 1];
		if (!next || !next.firstElementChild) {
			index = 0;
			next = divs[1];
		}

		next.firstElementChild.click();
  }
  
  static _reverseToggleUsers() {
		let index = 0;
		let divs = $('#J_NavChatScrollBody > div').children();
		for(let i = 0; i < divs.length; ++i) {
			let tmp = divs[i].firstElementChild;
			if (tmp) {
				let className = tmp.className;
				if (className.includes("active")) {
					index = i;
					break;
				}
			}
		}

		let prefix = divs[index - 1];
		if (!prefix || !prefix.firstElementChild) {
			index = 0;
			prefix = divs[1];
		}

		prefix.firstElementChild.click();
	}

	static _toggleFirstUser() {
		let divs = $('#J_NavChatScrollBody > div').children();
		let first = divs[1];
		first.firstElementChild.click();
	}
}
module.exports = MenuHandler;
