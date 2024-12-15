const pixelLight = {
    // 主色调
    "primary": "#FFD43B",        // 主按钮黄色
    "primary-focus": "#FCC419",
    "primary-content": "#000000", // 黑色文字

    // 次要颜色
    "secondary": "#FFFFFF",      // 白色背景
    "secondary-focus": "#F8F9FA",
    "secondary-content": "#000000",

    // 强调色
    "accent": "#FFD43B",        // 黄色强调
    "accent-focus": "#FCC419",
    "accent-content": "#000000",

    // 中性色
    "neutral": "#F5F0E6",       // 浅米色
    "neutral-focus": "#EBE6DC",
    "neutral-content": "#000000",

    // 基础颜色 - 使用浅米黄色系列
    "base-100": "#FDF8EF",      // 主背景色（最浅米黄）
    "base-200": "#F5F0E6",      // 次背景色（浅米黄）
    "base-300": "#EBE6DC",      // 深背景色（中等米黄）
    "base-content": "#000000",   // 文本颜色

    // 功能色
    "info": "#4A9EFF",
    "success": "#51CF66",
    "warning": "#FFD43B",
    "error": "#FF6B6B",

    ".btn": {
      "border": "3px solid #000000",
      "box-shadow": "3px 3px 0 0 #000000",
      "&:hover": {
        "box-shadow": "2px 2px 0 0 #000000",
        "transform": "translate(1px, 1px)"
      }
    },
    ".btn-primary": {
      "background-color": "#FFD43B",
      "color": "#000000"
    },
    ".btn-outline": {
      "background-color": "#FFFFFF",
      "color": "#000000"
    },
    ".badge": {
      "border": "3px solid #000000",
      "box-shadow": "3px 3px 0 0 #000000"
    },
    ".badge-neutral": {
      "background-color": "#F5F0E6",
      "color": "#000000"
    },
    ".badge-outline": {
      "background-color": "#FFFFFF",
      "color": "#000000"
    },
    ".badge-primary": {
      "background-color": "#000000",
      "color": "#FFFFFF"
    },
    ".badge-accent": {
      "background-color": "#FFD43B",
      "color": "#000000"
    },
    ".input": {
      "border": "3px solid #000000",
      "background-color": "#FFFFFF",
      "box-shadow": "3px 3px 0 0 #000000",
      "&:focus": {
        "outline": "none",
        "border-color": "#000000"
      }
    },
    ".textarea": {
      "border": "3px solid #000000",
      "background-color": "#FFFFFF",
      "box-shadow": "3px 3px 0 0 #000000",
      "&:focus": {
        "outline": "none",
        "border-color": "#000000"
      }
    },
    ".alert": {
      "border": "3px solid #000000",
      "box-shadow": "3px 3px 0 0 #000000",
      "background-color": "#FFD43B",
      "color": "#000000"
    },
    ".avatar": {
      "border": "3px solid #000000"
    },
    ".collapse": {
      "border": "3px solid #000000",
      "box-shadow": "3px 3px 0 0 #000000"
    },
    ".pixel-box": {
      "border": "3px solid #000000",
      "box-shadow": "3px 3px 0 0 #000000",
      "background-color": "#FFFFFF",
      "padding": "1rem",
    },
    ".pixel-switch": {
      "position": "relative",
      "display": "inline-flex",
      "height": "2rem",
      "width": "3.5rem",
      "flex-shrink": "0",
      "cursor": "pointer",
      "border": "3px solid #000000",
      "background-color": "#FFFFFF",
      "transition": "background-color 0.2s",
      "box-shadow": "3px 3px 0 0 #000000",
      "&[data-checked=true]": {
        "background-color": "#FFD43B",
      }
    },
    ".pixel-switch-button": {
      "position": "absolute",
      "top": "2px",
      "left": "2px",
      "height": "calc(2rem - 10px)",
      "width": "calc(2rem - 10px)",
      "background-color": "#000000",
      "transition": "transform 0.2s",
      "border": "2px solid #000000",
      "&[data-checked=true]": {
        "transform": "translateX(1.5rem)",
      }
    },

    ".pixel-table": {
      "width": "100%",
      "border-collapse": "separate",
      "border-spacing": "0",
      "border": "3px solid #000000",
      "box-shadow": "3px 3px 0 0 #000000",
      "background-color": "#FFFFFF",
      "& thead": {
        "background-color": "#FFD43B",
        "border-bottom": "3px solid #000000",
      },
      "& th": {
        "color": "#000000",
        "font-weight": "600",
        "text-align": "left",
        "padding": "1rem",
        "border-bottom": "3px solid #000000",
        "border-right": "3px solid #000000",
        "&:last-child": {
          "border-right": "none"
        }
      },
      "& td": {
        "padding": "1rem",
        "border-bottom": "3px solid #000000",
        "border-right": "3px solid #000000",
        "&:last-child": {
          "border-right": "none"
        }
      },
      "& tbody tr": {
        "transition": "background-color 0.2s",
        "&:hover": {
          "background-color": "#F8F9FA"
        },
        "&:last-child td": {
          "border-bottom": "none"
        }
      },
      // 紧凑模式
      "&.pixel-table-compact": {
        "& th, & td": {
          "padding": "0.5rem"
        }
      },
      // 斑马条纹
      "&.pixel-table-zebra tbody tr:nth-child(even)": {
        "background-color": "#F8F9FA"
      },
      // 边框模式
      "&.pixel-table-bordered": {
        "& th, & td": {
          "border": "3px solid #000000"
        }
      }
    },

    ".pixel-table-container": {
      "width": "100%",
      "overflow-x": "auto",
      "border": "3px solid #000000",
      "box-shadow": "3px 3px 0 0 #000000",
    },

    ".pixel-card": {
      "position": "relative",
      "background-color": "#FFFFFF",
      "border": "3px solid #000000",
      "box-shadow": "3px 3px 0 0 #000000",
      "transition": "transform 0.2s, box-shadow 0.2s",
      "&:hover": {
        "transform": "translate(1px, 1px)",
        "box-shadow": "2px 2px 0 0 #000000"
      }
    },

    ".pixel-card-header": {
      "padding": "1rem",
      "border-bottom": "3px solid #000000",
      "background-color": "#FFD43B",
      "font-weight": "600",
      "display": "flex",
      "align-items": "center",
      "justify-content": "space-between"
    },

    ".pixel-card-body": {
      "padding": "1rem",
      "background-color": "#FFFFFF"
    },

    ".pixel-card-footer": {
      "padding": "1rem",
      "border-top": "3px solid #000000",
      "background-color": "#F8F9FA",
      "display": "flex",
      "align-items": "center",
      "justify-content": "flex-end",
      "gap": "0.5rem"
    },

    ".pixel-card-compact": {
      "& .pixel-card-header": {
        "padding": "0.5rem"
      },
      "& .pixel-card-body": {
        "padding": "0.5rem"
      },
      "& .pixel-card-footer": {
        "padding": "0.5rem"
      }
    },

    ".pixel-card-bordered": {
      "& .pixel-card-body": {
        "border-bottom": "3px solid #000000"
      }
    },

    ".pixel-card-image": {
      "width": "100%",
      "height": "auto",
      "border-bottom": "3px solid #000000",
      "object-fit": "cover"
    },

    // 卡片标题
    ".pixel-card-title": {
      "font-size": "1.25rem",
      "font-weight": "600",
      "color": "#000000",
      "margin-bottom": "0.5rem"
    },

    // RetroUI 特色样式设置
    "--rounded-box": "0px",
    "--rounded-btn": "0px",
    "--rounded-badge": "0px",
    "--animation-btn": "0.15s",
    "--animation-input": "0.2s",
    "--btn-text-case": "none",
    "--btn-focus-scale": "0.98",
    "--border-btn": "3px",
    "--tab-border": "3px",
    "--tab-radius": "0",

    // 进度条样式
    ".progress": {
      "height": "1.5rem",
      "border": "3px solid #000000",
      "background-color": "#FFFFFF",
      "box-shadow": "3px 3px 0 0 #000000",
      "&::-webkit-progress-bar": {
        "background-color": "#FFFFFF"
      },
      "&::-webkit-progress-value": {
        "background-color": "#000000"
      },
      "&::-moz-progress-bar": {
        "background-color": "#000000"
      }
    },
  };

export default pixelLight;