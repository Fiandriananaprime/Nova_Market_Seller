import { driver, type Config, type Driver, type DriveStep, type PopoverDOM } from "driver.js"
import "@/features/tutorials/styles/tutorials.css"
import type { TourDefinition } from "../types"

export interface DriverConfigOptions {
  t: (key: string, options?: any) => string
  onDestroyed?: () => void
  onHighlightStarted?: (element?: Element, step?: DriveStep) => void
}

/**
 * Creates a configured Driver.js instance with Nova Market's design system and i18n support.
 */
export function createNovaDriver(
  tour: TourDefinition,
  options: DriverConfigOptions
): Driver {
  const { t, onDestroyed, onHighlightStarted } = options

  // Transform tour step definitions into Driver.js DriveStep objects
  const steps: DriveStep[] = tour.steps.map((step) => {
    const titleText = t(step.titleKey)
    const descText = t(step.descriptionKey)
    const badgeText = step.badgeKey ? t(step.badgeKey) : undefined

    return {
      element: step.element,
      data: {
        icon: step.icon,
        badge: badgeText,
      },
      popover: {
        title: titleText,
        description: descText,
        side: step.side ?? "bottom",
        align: step.align ?? "center",
        showButtons: ["next", "previous", "close"],
        showProgress: true,
        nextBtnText: t("tutorials.buttons.next"),
        prevBtnText: t("tutorials.buttons.prev"),
        doneBtnText: t("tutorials.buttons.finish"),
        closeBtnLabel: t("tutorials.buttons.skip"),
        progressText: t("tutorials.buttons.progressText"),
        onPopoverRender: (popover: PopoverDOM) => {
          // If a badge or icon is attached to step, inject it cleanly into the popover title
          if (step.badgeKey && badgeText && !popover.title.querySelector(".nova-popover-badge")) {
            const badgeEl = document.createElement("span")
            badgeEl.className = "nova-popover-badge"
            badgeEl.textContent = badgeText
            popover.wrapper.insertBefore(badgeEl, popover.title)
          }

          if (step.icon && !popover.title.querySelector(".nova-popover-icon-badge")) {
            const iconBadge = document.createElement("span")
            iconBadge.className = "nova-popover-icon-badge"
            iconBadge.textContent = step.icon
            popover.title.prepend(iconBadge)
          }
        },
      },
      onHighlightStarted: (element, s) => {
        onHighlightStarted?.(element, s)
      },
    }
  })

  const config: Config = {
    animate: true,
    smoothScroll: true,
    allowClose: true,
    overlayColor: "#16262E",
    overlayOpacity: 0.75,
    stagePadding: 8,
    stageRadius: 14,
    popoverClass: "nova-driver-popover",
    showProgress: true,
    progressText: t("tutorials.buttons.progressText"),
    nextBtnText: t("tutorials.buttons.next"),
    prevBtnText: t("tutorials.buttons.prev"),
    doneBtnText: t("tutorials.buttons.finish"),
    closeBtnLabel: t("tutorials.buttons.skip"),
    steps,
    onDestroyed: () => {
      onDestroyed?.()
    },
  }

  return driver(config)
}
