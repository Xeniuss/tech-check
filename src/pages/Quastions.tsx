import { Grid } from "@mantine/core";
import { Question } from "../components/question/Question";
import type { ParsedItem } from "../hooks/useLoadContent";

interface IQuestions {
    data: any;
    ratings: number[];
    setRatings: (updater: (prev: number[]) => number[]) => void;
}
export const Questions = ({ data, ratings, setRatings }: IQuestions) => {

    return (
        <Grid justify="flex-start" align="flex-start" maw={800}>
            {
                data ? (
                    data.map((item: ParsedItem, idx: number) => (
                        <Grid.Col span={12} key={idx}>
                            <Question
                                title={item.title}
                                content={item.desc}
                                codeBlock={item.codeblock as any}
                                rating={ratings[idx] ?? 0}
                                onRate={(v) => setRatings((r) => { const copy = [...r]; copy[idx] = v; return copy; })}
                            />
                        </Grid.Col>
                    ))
                ) : (
                    <Grid.Col span={12} >
                        <Question title="Sample Question" content="This is a sample question content." rating={ratings[0] ?? 0} onRate={(v) => setRatings((prev) => { const copy = [...prev]; copy[0] = v; return copy; })} />
                    </Grid.Col>
                )

            }
        </Grid>
    )
}