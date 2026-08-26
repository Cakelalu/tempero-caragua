import { createTheme } from "flowbite-react";

const flowbiteTheme = createTheme({
  // ========================================
  // TEXT INPUT
  // ========================================
  textInput: {
    field: {
      input: {
        base: `
          block
          w-full
          border
          focus:outline-none
          focus:ring-1
          disabled:cursor-not-allowed
          disabled:opacity-50
        `,
        colors: {
          gray: `
            border-pallete-dark-green
            bg-pallete-dark-green-2
            text-white
            placeholder-gray-400
            focus:border-pallete-orange
            focus:ring-pallete-orange
          `,
        },
        withShadow: {
          on: "shadow-sm",
          off: "",
        },
        sizes: {
          sm: "p-2 text-xs",
          md: "p-2.5 text-sm",
          lg: "p-4 text-base",
        },
      },
    },
  },

  // ========================================
  // LABEL
  // ========================================
  label: {
    root: {
      base: "mb-2 block text-sm font-medium",
      colors: {
        default: "text-pallete-dark-green-2",
      },
    },
  },

  // ========================================
  // BUTTON
  // ========================================
  button: {
    base: `
      group
      relative
      flex
      items-center
      justify-center
      rounded-lg
      text-center
      font-medium
      focus:z-10
      focus:outline-none
      focus:ring-4
      transition-colors
    `,

    color: {
      primary: `
        bg-pallete-dark-green-2
        text-white
        hover:bg-pallete-dark-green
        focus:ring-pallete-light-green
      `,

      secondary: `
        bg-pallete-orange
        text-white
        hover:bg-pallete-dark-orange
        focus:ring-pallete-light-orange
      `,

      green: `
        bg-pallete-green
        text-white
        hover:bg-pallete-dark-green
        focus:ring-pallete-light-green
      `,

      orange: `
        bg-pallete-orange
        text-white
        hover:bg-pallete-dark-orange
        focus:ring-pallete-light-orange
      `,

      pink: `
        bg-pallete-pink
        text-pallete-dark-green-2
        hover:opacity-90
        focus:ring-pallete-pink
      `,

      light: `
        bg-pallete-light-green
        text-pallete-dark-green-2
        hover:bg-pallete-green
        focus:ring-pallete-light-green
      `,
    },

    size: {
      xs: "px-3 py-2 text-xs",
      sm: "px-3 py-2 text-sm",
      md: "px-5 py-2.5 text-sm",
      lg: "px-5 py-3 text-base",
      xl: "px-6 py-3.5 text-base",
    },
  },

  // ========================================
  // CHECKBOX
  // ========================================
  checkbox: {
    root: {
      base: `
        h-4
        w-4
        rounded
        border
        border-pallete-dark-green
        bg-pallete-gray
        text-pallete-orange
        focus:ring-2
        focus:ring-pallete-orange
      `,
    },
  },

  // ========================================
  // TEXTAREA
  // ========================================
  textarea: {
    base: `
      block
      w-full
      rounded-lg
      border
      border-pallete-dark-green
      bg-pallete-dark-green-2
      p-2.5
      text-sm
      text-white
      placeholder-gray-400
      focus:border-pallete-orange
      focus:ring-pallete-orange
      focus:outline-none
    `,
  },

  // ========================================
  // SELECT
  // ========================================
  select: {
    field: {
      select: {
        base: `
          block
          w-full
          rounded-lg
          border
          border-pallete-dark-green
          bg-pallete-dark-green-2
          p-2.5
          text-sm
          text-white
          focus:border-pallete-orange
          focus:ring-pallete-orange
        `,
      },
    },
  },

  // ========================================
  // HELPER TEXT
  // ========================================
  helperText: {
    root: {
      base: "mt-2 text-sm",
      colors: {
        gray: "text-pallete-gray",
        failure: "text-pallete-dark-orange",
        success: "text-pallete-green",
      },
    },
  },

  // ========================================
  // ALERT
  // ========================================
  alert: {
    base: `
      flex
      items-center
      rounded-lg
      p-4
      text-sm
    `,

    color: {
      info: `
        bg-pallete-blue-green
        text-white
      `,

      success: `
        bg-pallete-light-green
        text-pallete-dark-green-2
      `,

      warning: `
        bg-pallete-light-orange
        text-pallete-dark-green-2
      `,

      failure: `
        bg-pallete-dark-orange
        text-white
      `,
    },
  },

  // ========================================
  // CARD
  // ========================================
  card: {
    root: {
      base: `
        flex
        flex-col
        rounded-lg
        border
        border-pallete-gray
        bg-white
        shadow-md
      `,
    },
  },
});

export default flowbiteTheme;