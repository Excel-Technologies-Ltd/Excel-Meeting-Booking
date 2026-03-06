import type { CollectionItem } from "@chakra-ui/react"
import { Listbox as ChakraListbox } from "@chakra-ui/react"
import * as React from "react"

export interface ListboxProps<T extends CollectionItem = CollectionItem>
  extends ChakraListbox.RootProps<T> {}

export const ListboxRoot = React.forwardRef<HTMLDivElement, ListboxProps>(
  function ListboxRoot(props, ref) {
    const { children, ...rest } = props
    return (
      <ChakraListbox.Root ref={ref} {...rest}>
        {children}
      </ChakraListbox.Root>
    )
  },
)

export const ListboxLabel = ChakraListbox.Label
export const ListboxContent = ChakraListbox.Content
export const ListboxItem = ChakraListbox.Item
export const ListboxItemText = ChakraListbox.ItemText
export const ListboxItemIndicator = ChakraListbox.ItemIndicator
export const ListboxItemGroup = ChakraListbox.ItemGroup
export const ListboxItemGroupLabel = ChakraListbox.ItemGroupLabel
