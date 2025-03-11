const pixelLight = {
    // Primary color
    "primary": "#FFD43B",
    "primary-focus": "#FCC419",
    "primary-content": "#000000",

    // Secondary color
    "secondary": "#FF00F5",
    "secondary-focus": "#D303CC",
    "secondary-content": "#FFFFFF",

    // Accent color
    "accent": "#FF4911",
    "accent-focus": "#FA4007",
    "accent-content": "#FFFFFF",

    // Neutral color
    "neutral": "#F5F0E6",
    "neutral-focus": "#EBE6DC",
    "neutral-content": "#000000",

    // Base color - use light yellow
    "base-100": "#FDF8EF",
    "base-200": "#F5F0E6",
    "base-300": "#EBE6DC",
    "base-content": "#000000",

    // Functions colors
    "info": "#7DF9FF",
    "success": "#2FFF2F",
    "warning": "#FFD43B",
    "error": "#FF4911",
    
    // Button
    ".btn": {
      "border": "2px solid #000000",
      "box-shadow": "3px 3px 0 0 #000000",
      "border-radius": "8px",
      "&:hover": {
        "border": "2px solid #333333",
        "box-shadow": "3px 3px 0 0 #000000",
        "transform": "translate(1px, 1px)",
        "background-color": "#FDF8EF"
      }
    },
    ".btn-primary": {
      "background-color": "#FFD43B",
      "color": "#000000",
      "&:hover": {
        "background-color": "#FCC419",
        "color": "#000000",
      }
    },

    ".btn-secondary": {
      "background-color": "#FF00F5",
      "color": "#FFFFFF",
      "&:hover": {
        "background-color": "#D303CC",
        "color": "#FFFFFF",
      }
    },

    ".btn-outline": {
      "background-color": "#FFFFFF",
      "color": "#000000",
      "&:hover": {
        "background-color": "#ffffff",
        "color": "#000000",
      }
    },

    ".btn-error": {
      "background-color": "#FF4911",
      "color": "#FFFFFF",
      "&:hover": {
        "background-color": "#FA4007",
        "color": "#FFFFFF",
      }
    },

    ".search-btn": {
      "border": "2px solid #000000",
      "box-shadow": "3px 3px 0 0 #000000",
      "border-radius": "8px",
      "&:hover": {
        "border": "2px solid #333333",
        "box-shadow": "3px 3px 0 0 #000000",
        "background-color": "#f8d764"
      }
    },

    ".pagination-btn": {
      "border": "2px solid #000000",
      "box-shadow": "2px 2px 0 0 #000000",
      "border-radius": "6px",
      "&:hover": {
        "border": "2px solid #333333",
        "box-shadow": "2px 2px 0 0 #000000",
        "background-color": "#f8d764"
      }
    },

    // Badge
    ".badge": {
      "border": "2px solid #000000",
      "box-shadow": "1px 1px 0 0 #000000",
      "height": "1.75rem",
      "border-radius": "6px",
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
      "background-color": "#FFD43B",
      "color": "#000000"
    },
    ".badge-accent": {
      "background-color": "#2FFF2F",
      "color": "#000000"
    },

    // Input
    ".input": {
      "border": "2px solid #000000",
      "background-color": "#FFFFFF",
      "box-shadow": "3px 3px 0 0 #000000",
      "border-radius": "8px",
      "&:focus": {
        "outline": "none",
        "border-color": "#000000"
      }
    },

    // Search input
    ".search-input": {
      "border-top-left-radius": "8px",
      "border-bottom-left-radius": "8px",
      "border-top-right-radius": "0",
      "border-bottom-right-radius": "0",
    },

    // Textarea
    ".pixel-textarea": {
      "border": "2px solid #000000",
      "background-color": "#FFFFFF",
      "box-shadow": "3px 3px 0 0 #000000",
      "border-radius": "8px",
      "padding": "1rem",
      "&:focus": {
        "outline": "none",
        "border-color": "#000000"
      }
    },

    // Alert
    ".pixel-alert": {
      "border": "2px solid #000000",
      "box-shadow": "3px 3px 0 0 #000000",
      "background-color": "#FA4007",
      "border-radius": "8px",
      "padding": "1rem",
      "color": "#000000"
    },

    // Avatar
    ".pixel-avatar-round": {
      "border": "2px solid #000",
      "border-radius": "100%",
      "box-shadow": "2px 2px 0 0 #333",
    },

    ".pixel-avatar": {
      "border": "2px solid #000",
      "border-radius": "8px",
      "box-shadow": "2px 2px 0 0 #333",
    },

    // Collapse
    ".collapse": {
      "border": "2px solid #000000",
      "box-shadow": "3px 3px 0 0 #000000"
    },

    // Pixel Box
    ".pixel-box": {
      "border": "2px solid #000000",
      "box-shadow": "3px 3px 0 0 #000000",
      "background-color": "#FDF8EF",
      "border-radius": "8px",
      "padding": "0.75rem 1rem",
      // "transition": "transform 0.2s, box-shadow 0.2s",
      // "&:hover": {
      //   "transform": "translate(1px, 1px)",
      //   "box-shadow": "2px 2px 0 0 #000000"
      // }
    },
    ".pixel-box-primary": {
      "border": "2px solid #000000",
      "box-shadow": "3px 3px 0 0 #000000",
      "background-color": "#FF00F5",
      "color": "#ffffff",
      "border-radius": "8px",
      "padding": "0.75rem 1rem",
      // "transition": "transform 0.2s, box-shadow 0.2s",
      // "&:hover": {
      //   "transform": "translate(1px, 1px)",
      //   "box-shadow": "2px 2px 0 0 #000000"
      // }
    },

    // Pixel Switch
    ".pixel-switch": {
      "position": "relative",
      "display": "inline-flex",
      "height": "2rem",
      "width": "3.5rem",
      "flex-shrink": "0",
      "cursor": "pointer",
      "border": "2px solid #000000",
      "background-color": "#FFFFFF",
      "transition": "background-color 0.2s",
      "box-shadow": "2px 2px 0 0 #000000",
      "border-radius": "6px",
      "&[data-checked=true]": {
        "background-color": "#FFD43B",
      }
    },
    ".pixel-switch-button": {
      "position": "absolute",
      "top": "3px",
      "left": "3px",
      "height": "calc(2rem - 10px)",
      "width": "calc(2rem - 10px)",
      "background-color": "#000000",
      "border-radius": "4px",
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
      "border": "2px solid #000000",
      "box-shadow": "3px 3px 0 0 #000000",
      "background-color": "#FDF8EF",
      "& thead": {
        "background-color": "#FFD43B",
        "border-bottom": "2px solid #000000",
      },
      "& th": {
        "color": "#000000",
        "font-weight": "600",
        "text-align": "left",
        "padding": "0.5rem",
        "white-space": "nowrap",
        "border-bottom": "2px solid #000000",
        "border-right": "2px solid #000000",
        "&:last-child": {
          "border-right": "none"
        }
      },
      "& td": {
        "padding": "0.5rem",
        "border-bottom": "2px solid #000000",
        "border-right": "2px solid #000000",
        "white-space": "nowrap",
        "&:last-child": {
          "border-right": "none"
        }
      },
      "& tbody tr": {
        "transition": "background-color 0.2s",
        "white-space": "nowrap",
        "&:hover": {
          "background-color": "#E3A018",
          "color": "#000000"
        },
        "&:last-child td": {
          "border-bottom": "none",
          "white-space": "nowrap",
        }
      },

      // Compact mode
      "&.pixel-table-compact": {
        "& th, & td": {
          "padding": "0.25rem"
        }
      },
      // Zebra
      "&.pixel-table-zebra tbody tr:nth-child(even)": {
        "background-color": "#F8F9FA"
      },
      // Border mode
      "&.pixel-table-bordered": {
        "& th, & td": {
          "border": "2px solid #000000"
        }
      }
    },

    ".pixel-table-container": {
      "width": "100%",
      "overflow-x": "auto",
      "border": "2px solid #000000",
      "box-shadow": "3px 3px 0 0 #000000",
    },

    ".pixel-card": {
      "position": "relative",
      "background-color": "#9723C9",
      "border": "2px solid #000000",
      "box-shadow": "3px 3px 0 0 #000000",
      "color": "#FFFFFF",
      // "transition": "transform 0.2s, box-shadow 0.2s",
      // "&:hover": {
      //   "transform": "translate(1px, 1px)",
      //   "box-shadow": "2px 2px 0 0 #000000"
      // }
    },

    ".pixel-card-header": {
      "padding": "1rem",
      "border-bottom": "3px solid #000000",
      "background-color": "#FFD43B",
      "font-weight": "600",
      "display": "flex",
      "align-items": "center",
      "justify-content": "space-between",
      "color": "#FFFFFF",
    },

    ".pixel-card-body": {
      "padding": "1rem",
      "background-color": "#9723C9",
      "color": "#FFFFFF",
    },

    ".pixel-card-footer": {
      "padding": "1rem",
      "border-top": "3px solid #000000",
      "background-color": "#F8F9FA",
      "display": "flex",
      "align-items": "center",
      "justify-content": "flex-end",
      "gap": "0.5rem",
      "color": "#FFFFFF",
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
      "object-fit": "cover",
      "color": "#FFFFFF",
    },

    // Card title
    ".pixel-card-title": {
      "font-size": "1.25rem",
      "font-weight": "600",
      "color": "#FFFFFF",
      "margin-bottom": "0.5rem"
    },

    // RetroUI
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

    // Progress
    ".pixel-progress": {
      "height": "1.5rem",
      "border": "2px solid #000000",
      "background-color": "#FFFFFF",
      "box-shadow": "2px 2px 0 0 #000000",
      "border-radius": "8px",
      "&::-webkit-progress-bar": {
        "background-color": "#FFFFFF",
        "border-radius": "8px",
      },
      "&::-webkit-progress-value": {
        "background-color": "#2FFF2F",
        "border-radius": "8px",
      },
      "&::-moz-progress-bar": {
        "background-color": "#000000",
        "border-radius": "8px",
      }
    },

    // Select
    ".select": {
      "border": "2px solid #000000",
      "background-color": "#FFFFFF",
      "box-shadow": "2px 2px 0 0 #000000",
      "border-radius": "8px",
      "cursor": "pointer",
      "&:focus": {
        "outline": "none",
        "border-color": "#000000"
      },
    },

    // Checkbox
    ".checkbox": {
      "border": "2px solid #000000",
      "background-color": "#FFFFFF",
      "margin-right": "0.5rem",
      "box-shadow": "2px 2px 0 0 #000000",
      "border-radius": "8px",
      "cursor": "pointer",
      "transition": "transform 0.2s, box-shadow 0.2s",
      "&:hover": {
        "border": "2px solid #000000",
        "box-shadow": "2px 2px 0 0 #000000",
        "border-radius": "8px",
      },
      "&:focus": {
        "border": "2px solid #000000",
        "box-shadow": "2px 2px 0 0 #000000",
        "border-radius": "8px",
        },
    },
    
    // Title
    ".title": {
      "font-size": "1.5rem",
      "font-weight": "600",
      "color": "#000000",
      "text-shadow": "4px 4px 0 0 #FFFFFF",
    },
  };

// export default pixelLight;
module.exports = pixelLight;