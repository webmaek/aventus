import {
  ActionIcon,
  Box,
  Button,
  createStyles,
  Flex,
  Popover,
  Text,
} from "@mantine/core";
import { showNotification } from "@mantine/notifications";
import { IconDots } from "@tabler/icons-react";
import { useRouter } from "next/router";
import { CommentResponse, UserResponse } from "shared";

import { Avatar } from "@/components/Avatar";
import { api } from "@/utils/api";
import { QUERY_KEYS } from "@/utils/constants";
import { dayjs } from "@/utils/dayjs";
import { queryClient } from "@/utils/queryClient";
import { ParamsWithSlug } from "@/utils/types";

export function CommentBox({ comment }: { comment: CommentResponse }) {
  const router = useRouter();

  const { slug } = router.query as ParamsWithSlug;

  const { classes } = styles();

  const user = queryClient.getQueryData<UserResponse>([
    QUERY_KEYS.USER_DETAILS,
  ]);

  const { mutate } = api.comment.useDelete(
    { slug },
    {
      onSuccess: () => {
        showNotification({
          title: "Comment deleted",
          message: "Your comment has been deleted",
        });
        queryClient.invalidateQueries([QUERY_KEYS.COMMENTS, slug]);
        queryClient.invalidateQueries([QUERY_KEYS.PROJECT_STATS, slug]);
      },
    }
  );

  return (
    <Flex align="start" justify="start" mt={10}>
      <Box>
        <Avatar src={comment.user?.avatar} color="teal" alt="Avatar" />
      </Box>
      <Box p={10} ml={15} w="100%" className={classes.comment}>
        <Flex justify="space-between">
          <Flex align="end">
            <Text transform="capitalize" color="gray.8">
              {comment.user?.name}
            </Text>
            <Text ml={10} color="gray.6" fz="sm" fw={300}>
              {dayjs(comment.createdAt).fromNow()}
            </Text>
          </Flex>
          {comment.user.id === user?.id && (
            <Popover position="top" shadow="md">
              <Popover.Target>
                <ActionIcon>
                  <IconDots size={18} />
                </ActionIcon>
              </Popover.Target>
              <Popover.Dropdown>
                <Button
                  onClick={() => mutate({ id: comment.id })}
                  color="red"
                  variant="outline"
                  fullWidth
                >
                  Delete comment
                </Button>
              </Popover.Dropdown>
            </Popover>
          )}
        </Flex>

        <Text mt={20} fw={400} color="gray.9">
          {comment.content}
        </Text>
      </Box>
    </Flex>
  );
}

const styles = createStyles((theme) => ({
  comment: {
    border: `1px solid ${theme.colors.gray[3]}`,
    boxShadow: theme.shadows.sm,
  },
}));
