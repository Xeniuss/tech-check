import { Grid } from "@mantine/core"
import JsonBuilder from "../components/JsonBuilder"

export const Builder = () => {
    return (<Grid justify="flex-start" align="flex-start" maw={800} gutter={16}>
        <JsonBuilder />
    </Grid>)
}